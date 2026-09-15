import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, max } from 'drizzle-orm'
import { requireBudgetRole } from '@/server/budget/access.server'
import { db } from '@/server/db/client.server'
import { categories, incomes } from '@/server/db/schema'
import { authMiddleware } from '../auth/auth.middleware'
import { budgetScopeSchema, deleteItemSchema, saveCategorySchema, saveIncomeSchema } from '../budget/budget.schemas'

export const listIncomesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(budgetScopeSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId)
    return db
      .select({ id: incomes.id, label: incomes.label, amount: incomes.amount })
      .from(incomes)
      .where(eq(incomes.budgetId, data.budgetId))
      .orderBy(asc(incomes.createdAt))
  })

export const saveIncomeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(saveIncomeSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'editor')
    const values = { label: data.label, amount: data.amount }

    if (data.id) {
      await db
        .update(incomes)
        .set(values)
        .where(and(eq(incomes.id, data.id), eq(incomes.budgetId, data.budgetId)))
      return
    }
    await db.insert(incomes).values({ ...values, budgetId: data.budgetId })
  })

export const deleteIncomeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(deleteItemSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'editor')
    await db.delete(incomes).where(and(eq(incomes.id, data.id), eq(incomes.budgetId, data.budgetId)))
  })

export const listCategoriesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(budgetScopeSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId)
    return db
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        kind: categories.kind,
        monthlyAmount: categories.monthlyAmount,
      })
      .from(categories)
      .where(eq(categories.budgetId, data.budgetId))
      .orderBy(asc(categories.position), asc(categories.createdAt))
  })

export const saveCategoryFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(saveCategorySchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'editor')
    const values = { name: data.name, icon: data.icon, kind: data.kind, monthlyAmount: data.monthlyAmount }

    if (data.id) {
      await db
        .update(categories)
        .set(values)
        .where(and(eq(categories.id, data.id), eq(categories.budgetId, data.budgetId)))
      return
    }

    const [last] = await db
      .select({ position: max(categories.position) })
      .from(categories)
      .where(eq(categories.budgetId, data.budgetId))
    await db.insert(categories).values({ ...values, budgetId: data.budgetId, position: (last?.position ?? -1) + 1 })
  })

export const deleteCategoryFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(deleteItemSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'editor')
    await db.delete(categories).where(and(eq(categories.id, data.id), eq(categories.budgetId, data.budgetId)))
  })
