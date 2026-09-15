import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, eq, gte, lte, sql, sum } from 'drizzle-orm'
import { monthRange } from '@/lib/month'
import { requireBudgetRole } from '@/server/budget/access.server'
import { db } from '@/server/db/client.server'
import { budgetMembers, budgets, categories, expenses, incomes } from '@/server/db/schema'
import { authMiddleware } from '../auth/auth.middleware'
import { computeSummary } from './budget.logic'
import { budgetScopeSchema, monthScopeSchema, renameBudgetSchema } from './budget.schemas'

export const listMyBudgetsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) =>
    db
      .select({ id: budgets.id, name: budgets.name, role: budgetMembers.role })
      .from(budgetMembers)
      .innerJoin(budgets, eq(budgets.id, budgetMembers.budgetId))
      .where(eq(budgetMembers.userId, context.user.id))
      .orderBy(asc(budgetMembers.joinedAt)),
  )

export const getBudgetFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(budgetScopeSchema)
  .handler(async ({ data, context }) => {
    const { budget, role } = await requireBudgetRole(context.user.id, data.budgetId)
    const [members] = await db
      .select({ value: count() })
      .from(budgetMembers)
      .where(eq(budgetMembers.budgetId, budget.id))

    return {
      id: budget.id,
      name: budget.name,
      currency: budget.currency,
      role,
      memberCount: members?.value ?? 1,
    }
  })

/** Everything the dashboard needs for one month, computed server-side in a few aggregate queries. */
export const getMonthOverviewFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(monthScopeSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId)
    const { from, to } = monthRange(data.month)

    const [incomeRows, categoryRows, spentRows] = await Promise.all([
      db.select({ amount: incomes.amount }).from(incomes).where(eq(incomes.budgetId, data.budgetId)),
      db
        .select({
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          kind: categories.kind,
          monthlyAmount: categories.monthlyAmount,
        })
        .from(categories)
        .where(eq(categories.budgetId, data.budgetId))
        .orderBy(asc(categories.position), asc(categories.createdAt)),
      db
        .select({
          categoryId: expenses.categoryId,
          amount: sql<number>`${sum(expenses.amount)}::int`,
        })
        .from(expenses)
        .where(and(eq(expenses.budgetId, data.budgetId), gte(expenses.spentOn, from), lte(expenses.spentOn, to)))
        .groupBy(expenses.categoryId),
    ])

    return {
      month: data.month,
      summary: computeSummary({ incomes: incomeRows, categories: categoryRows, expenses: spentRows }),
      fixedCharges: categoryRows.filter((c) => c.kind === 'fixed'),
    }
  })

export const renameBudgetFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(renameBudgetSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'owner')
    await db.update(budgets).set({ name: data.name }).where(eq(budgets.id, data.budgetId))
  })

export const deleteBudgetFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(budgetScopeSchema)
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'owner')
    await db.delete(budgets).where(eq(budgets.id, data.budgetId))
  })
