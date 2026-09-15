import { queryOptions } from '@tanstack/react-query'
import type { Month } from '@/lib/month'
import { listExpensesFn } from '../expenses/expenses.functions'
import { listMembersFn } from '../members/members.functions'
import { listCategoriesFn, listIncomesFn } from '../settings/settings.functions'
import { getBudgetFn, getMonthOverviewFn, listMyBudgetsFn } from './budget.functions'

/** Every budget-scoped key starts with `['budget', budgetId]`, so one invalidation refreshes it all. */
export const budgetKeys = {
  all: (budgetId: string) => ['budget', budgetId] as const,
}

export const budgetQueries = {
  mine: () =>
    queryOptions({
      queryKey: ['budgets', 'mine'],
      queryFn: () => listMyBudgetsFn(),
    }),

  detail: (budgetId: string) =>
    queryOptions({
      queryKey: [...budgetKeys.all(budgetId), 'detail'],
      queryFn: () => getBudgetFn({ data: { budgetId } }),
    }),

  overview: (budgetId: string, month: Month) =>
    queryOptions({
      queryKey: [...budgetKeys.all(budgetId), 'overview', month],
      queryFn: () => getMonthOverviewFn({ data: { budgetId, month } }),
    }),

  expenses: (budgetId: string, filters: { month: Month; categoryId?: string; limit?: number }) =>
    queryOptions({
      queryKey: [...budgetKeys.all(budgetId), 'expenses', filters],
      queryFn: () => listExpensesFn({ data: { budgetId, ...filters } }),
    }),

  incomes: (budgetId: string) =>
    queryOptions({
      queryKey: [...budgetKeys.all(budgetId), 'incomes'],
      queryFn: () => listIncomesFn({ data: { budgetId } }),
    }),

  categories: (budgetId: string) =>
    queryOptions({
      queryKey: [...budgetKeys.all(budgetId), 'categories'],
      queryFn: () => listCategoriesFn({ data: { budgetId } }),
    }),

  members: (budgetId: string) =>
    queryOptions({
      queryKey: [...budgetKeys.all(budgetId), 'members'],
      queryFn: () => listMembersFn({ data: { budgetId } }),
    }),
}

export type Expense = Awaited<ReturnType<typeof listExpensesFn>>[number]
export type Category = Awaited<ReturnType<typeof listCategoriesFn>>[number]
export type Income = Awaited<ReturnType<typeof listIncomesFn>>[number]
export type Member = Awaited<ReturnType<typeof listMembersFn>>[number]
export type BudgetDetail = Awaited<ReturnType<typeof getBudgetFn>>
export type MonthOverview = Awaited<ReturnType<typeof getMonthOverviewFn>>
