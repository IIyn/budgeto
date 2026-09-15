import { z } from 'zod'
import { monthSchema } from '@/lib/month'
import { CATEGORY_ICON_NAMES } from './budget.constants'

/** Money is exchanged in cents (integers) between client and server. */
export const centsSchema = z
  .number()
  .int('Montant invalide')
  .min(0, 'Le montant doit être positif')
  .max(100_000_000, 'Montant trop élevé')

export const budgetIdSchema = z.uuid()

export const budgetScopeSchema = z.object({ budgetId: budgetIdSchema })

export const monthScopeSchema = budgetScopeSchema.extend({ month: monthSchema })

export const categoryKindSchema = z.enum(['fixed', 'flexible'])
export const memberRoleSchema = z.enum(['owner', 'editor', 'viewer'])
export const categoryIconSchema = z.enum(CATEGORY_ICON_NAMES)

export const labelSchema = z.string().trim().min(1, 'Champ requis').max(60, '60 caractères maximum')

export const incomeDraftSchema = z.object({
  label: labelSchema,
  amount: centsSchema,
})

export const categoryDraftSchema = z.object({
  name: labelSchema,
  icon: categoryIconSchema,
  kind: categoryKindSchema,
  monthlyAmount: centsSchema,
})

export const saveIncomeSchema = budgetScopeSchema.extend(incomeDraftSchema.shape).extend({
  id: z.uuid().optional(),
})

export const saveCategorySchema = budgetScopeSchema.extend(categoryDraftSchema.shape).extend({
  id: z.uuid().optional(),
})

export const deleteItemSchema = budgetScopeSchema.extend({ id: z.uuid() })

export const saveExpenseSchema = budgetScopeSchema.extend({
  id: z.uuid().optional(),
  label: labelSchema,
  amount: centsSchema.min(1, 'Le montant doit être supérieur à 0'),
  categoryId: z.uuid().nullable(),
  icon: categoryIconSchema.nullable(),
  spentOn: z.iso.date('Date invalide'),
})

export const listExpensesSchema = monthScopeSchema.extend({
  categoryId: z.uuid().optional(),
  limit: z.number().int().min(1).max(500).optional(),
})

export const renameBudgetSchema = budgetScopeSchema.extend({ name: labelSchema })

export const completeOnboardingSchema = z.object({
  displayName: labelSchema,
  budgetName: labelSchema,
  incomes: z.array(incomeDraftSchema).min(1, 'Ajoutez au moins une ressource'),
  categories: z.array(categoryDraftSchema).max(50),
})

export type IncomeDraft = z.infer<typeof incomeDraftSchema>
export type CategoryDraft = z.infer<typeof categoryDraftSchema>
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>
export type CategoryKind = z.infer<typeof categoryKindSchema>
export type MemberRole = z.infer<typeof memberRoleSchema>
