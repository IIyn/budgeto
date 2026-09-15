import { z } from 'zod'
import { budgetScopeSchema, memberRoleSchema } from '../budget/budget.schemas'

export const updateMemberRoleSchema = budgetScopeSchema.extend({
  userId: z.uuid(),
  role: memberRoleSchema,
})

export const removeMemberSchema = budgetScopeSchema.extend({ userId: z.uuid() })

export const createInvitationSchema = budgetScopeSchema.extend({ role: memberRoleSchema })

export const invitationTokenSchema = z.object({ token: z.string().min(20).max(100) })

export const INVITATION_DAYS = 7
