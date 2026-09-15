import { setResponseStatus } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { hasRole } from '@/features/budget/budget.logic'
import { db } from '../db/client.server'
import { budgetMembers, budgets, type MemberRole } from '../db/schema'

/**
 * Loads the budget if the user is a member with at least `minimum` role.
 * Every server function touching budget data goes through this check.
 */
export async function requireBudgetRole(userId: string, budgetId: string, minimum: MemberRole = 'viewer') {
  const [row] = await db
    .select({ budget: budgets, role: budgetMembers.role })
    .from(budgetMembers)
    .innerJoin(budgets, eq(budgets.id, budgetMembers.budgetId))
    .where(and(eq(budgetMembers.budgetId, budgetId), eq(budgetMembers.userId, userId)))
    .limit(1)

  if (!row) {
    setResponseStatus(404)
    throw new Error('Budget introuvable')
  }

  if (!hasRole(row.role, minimum)) {
    setResponseStatus(403)
    throw new Error("Vous n'avez pas les droits pour effectuer cette action")
  }

  return row
}
