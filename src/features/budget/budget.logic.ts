import { DEFAULT_FLEXIBLE_WEIGHT, ROLE_RANK } from './budget.constants'

type Role = keyof typeof ROLE_RANK

export function hasRole(role: Role, minimum: Role) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum]
}

type CategoryLike = { id?: string; kind: 'fixed' | 'flexible'; monthlyAmount: number }

/** Envelopes first: they are what everyday expenses are filed under. */
export function sortEnvelopesFirst<T extends { kind: 'fixed' | 'flexible' }>(categories: T[]) {
  return [...categories].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'flexible' ? -1 : 1))
}

export type SummaryInput<TCategory extends CategoryLike> = {
  incomes: { amount: number }[]
  categories: TCategory[]
  /** Expenses and one-off incomes added during the month. */
  operations: { kind: 'expense' | 'income'; amount: number; categoryId: string | null }[]
}

/** All the numbers displayed on the dashboard, derived from the raw budget data. */
export function computeSummary<TCategory extends CategoryLike>({
  incomes,
  categories,
  operations,
}: SummaryInput<TCategory>) {
  const expenses = operations.filter((o) => o.kind === 'expense')
  const income = sum(incomes.map((i) => i.amount))
  const fixed = sum(categories.filter((c) => c.kind === 'fixed').map((c) => c.monthlyAmount))
  const allocated = sum(categories.filter((c) => c.kind === 'flexible').map((c) => c.monthlyAmount))
  const spent = sum(expenses.map((e) => e.amount))
  const extraIncome = sum(operations.filter((o) => o.kind === 'income').map((o) => o.amount))

  const spentByCategory = new Map<string | null, number>()
  for (const expense of expenses) {
    spentByCategory.set(expense.categoryId, (spentByCategory.get(expense.categoryId) ?? 0) + expense.amount)
  }

  const envelopes = categories
    .filter((c) => c.kind === 'flexible')
    .map((category) => {
      const categorySpent = spentByCategory.get(category.id ?? null) ?? 0
      return { ...category, spent: categorySpent, left: category.monthlyAmount - categorySpent }
    })

  return {
    income,
    /** One-off money received this month (refund, bonus, gift...), on top of the recurring incomes. */
    extraIncome,
    fixed,
    allocated,
    spent,
    /** What is left once rent, bills and other mandatory charges are paid. */
    afterFixed: income + extraIncome - fixed,
    /** What is left for the month once the expenses already added are also deducted. */
    remaining: income + extraIncome - fixed - spent,
    /** Money that is neither a fixed charge nor assigned to an envelope. */
    unallocated: income - fixed - allocated,
    uncategorizedSpent: spentByCategory.get(null) ?? 0,
    envelopes,
  }
}

export type BudgetSummary<TCategory extends CategoryLike = CategoryLike> = ReturnType<
  typeof computeSummary<TCategory>
>

type FlexibleDraft = { monthlyAmount: number; weight?: number; estimate?: number }

const ROUNDING = 500
const SAFETY_MARGIN = 0.9

/**
 * Proposes an amount for each flexible envelope from the money left after fixed charges.
 * User estimates are kept when they fit, otherwise preset weights are used, and everything is
 * scaled to keep a 10% margin, rounded down to 5 €.
 */
export function suggestAllocation<T extends FlexibleDraft>(envelopes: T[], afterFixed: number): T[] {
  if (afterFixed <= 0 || envelopes.length === 0) {
    return envelopes.map((envelope) => ({ ...envelope, monthlyAmount: 0 }))
  }

  const totalWeight = sum(envelopes.map((e) => e.weight ?? DEFAULT_FLEXIBLE_WEIGHT))
  const budget = afterFixed * SAFETY_MARGIN
  const wanted = envelopes.map((envelope) =>
    envelope.estimate && envelope.estimate > 0
      ? envelope.estimate
      : (budget * (envelope.weight ?? DEFAULT_FLEXIBLE_WEIGHT)) / totalWeight,
  )
  const scale = Math.min(1, budget / sum(wanted))

  return envelopes.map((envelope, index) => ({
    ...envelope,
    monthlyAmount: Math.floor(((wanted[index] ?? 0) * scale) / ROUNDING) * ROUNDING,
  }))
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}
