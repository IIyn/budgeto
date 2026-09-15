import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, eq, lt } from 'drizzle-orm'
import { generateToken, hashToken } from '@/server/auth/tokens.server'
import { requireBudgetRole } from '@/server/budget/access.server'
import { db, type Transaction } from '@/server/db/client.server'
import { budgetMembers, budgets, invitations, users } from '@/server/db/schema'
import { authMiddleware } from '../auth/auth.middleware'
import { budgetScopeSchema } from '../budget/budget.schemas'
import {
  createInvitationSchema,
  INVITATION_DAYS,
  invitationTokenSchema,
  removeMemberSchema,
  updateMemberRoleSchema,
} from './members.schemas'

export const listMembersFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(budgetScopeSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId)
    const rows = await db
      .select({
        userId: users.id,
        username: users.username,
        displayName: users.displayName,
        role: budgetMembers.role,
        joinedAt: budgetMembers.joinedAt,
      })
      .from(budgetMembers)
      .innerJoin(users, eq(users.id, budgetMembers.userId))
      .where(eq(budgetMembers.budgetId, data.budgetId))
      .orderBy(asc(budgetMembers.joinedAt))

    return rows.map((row) => ({ ...row, isCurrentUser: row.userId === context.user.id }))
  })

export const updateMemberRoleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateMemberRoleSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'owner')

    await db.transaction(async (tx) => {
      await tx
        .update(budgetMembers)
        .set({ role: data.role })
        .where(and(eq(budgetMembers.budgetId, data.budgetId), eq(budgetMembers.userId, data.userId)))
      await assertHasOwner(tx, data.budgetId)
    })
  })

/** Owners can remove anyone; any member can remove themself (leave the budget). */
export const removeMemberFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(removeMemberSchema)
  .handler(async ({ data, context }) => {
    const isSelf = data.userId === context.user.id
    await requireBudgetRole(context.user.id, data.budgetId, isSelf ? 'viewer' : 'owner')

    await db.transaction(async (tx) => {
      await tx
        .delete(budgetMembers)
        .where(and(eq(budgetMembers.budgetId, data.budgetId), eq(budgetMembers.userId, data.userId)))
      await assertHasOwner(tx, data.budgetId)
    })
  })

export const createInvitationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createInvitationSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'owner')

    const token = generateToken()
    const expiresAt = new Date(Date.now() + INVITATION_DAYS * 24 * 60 * 60 * 1000)

    await db.delete(invitations).where(lt(invitations.expiresAt, new Date()))
    await db.insert(invitations).values({
      id: hashToken(token),
      budgetId: data.budgetId,
      role: data.role,
      createdBy: context.user.id,
      expiresAt,
    })

    // The raw token only exists in this response: the link is built client-side from the current origin.
    return { token, expiresAt: expiresAt.toISOString() }
  })

/** Public: shown to people opening an invitation link, signed in or not. */
export const getInvitationFn = createServerFn({ method: 'GET' })
  .validator(invitationTokenSchema)
  .handler(async ({ data }) => {
    const [row] = await db
      .select({
        budgetId: budgets.id,
        budgetName: budgets.name,
        inviterName: users.displayName,
        role: invitations.role,
        expiresAt: invitations.expiresAt,
      })
      .from(invitations)
      .innerJoin(budgets, eq(budgets.id, invitations.budgetId))
      .innerJoin(users, eq(users.id, invitations.createdBy))
      .where(eq(invitations.id, hashToken(data.token)))
      .limit(1)

    if (!row) return null
    return { ...row, expired: row.expiresAt.getTime() < Date.now() }
  })

export const acceptInvitationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(invitationTokenSchema)
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const [invitation] = await tx
        .delete(invitations)
        .where(eq(invitations.id, hashToken(data.token)))
        .returning()

      if (!invitation || invitation.expiresAt.getTime() < Date.now()) {
        throw new Error("Cette invitation n'est plus valide")
      }

      await tx
        .insert(budgetMembers)
        .values({ budgetId: invitation.budgetId, userId: context.user.id, role: invitation.role })
        .onConflictDoNothing()

      return { budgetId: invitation.budgetId }
    }),
  )

async function assertHasOwner(tx: Transaction, budgetId: string) {
  const [owners] = await tx
    .select({ value: count() })
    .from(budgetMembers)
    .where(and(eq(budgetMembers.budgetId, budgetId), eq(budgetMembers.role, 'owner')))

  if (!owners?.value) {
    throw new Error('Le budget doit garder au moins un propriétaire')
  }
}
