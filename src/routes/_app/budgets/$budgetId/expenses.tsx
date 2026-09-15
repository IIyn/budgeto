import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { MonthSwitcher } from '@/components/layout/month-switcher'
import { budgetQueries, type Expense } from '@/features/budget/budget.queries'
import { hasRole } from '@/features/budget/budget.logic'
import { CategoryFilter } from '@/features/expenses/components/category-filter'
import { ExpenseDrawer } from '@/features/expenses/components/expense-drawer'
import { ExpensesByDay } from '@/features/expenses/components/expenses-by-day'
import { formatMoney } from '@/lib/money'
import { currentMonth, monthSchema } from '@/lib/month'

const expensesSearchSchema = z.object({
  month: monthSchema.optional().catch(undefined),
  category: z.uuid().optional().catch(undefined),
})

export const Route = createFileRoute('/_app/budgets/$budgetId/expenses')({
  validateSearch: expensesSearchSchema,
  loaderDeps: ({ search }) => ({ month: search.month ?? currentMonth(), category: search.category }),
  loader: async ({ context, params, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        budgetQueries.expenses(params.budgetId, { month: deps.month, categoryId: deps.category }),
      ),
      context.queryClient.ensureQueryData(budgetQueries.categories(params.budgetId)),
    ])
    return deps
  },
  head: () => ({ meta: [{ title: 'Dépenses — Budgeto' }] }),
  component: ExpensesPage,
})

function ExpensesPage() {
  const { budgetId } = Route.useParams()
  const { month, category } = Route.useLoaderData()
  const { data: budget } = useSuspenseQuery(budgetQueries.detail(budgetId))
  const { data: categories } = useSuspenseQuery(budgetQueries.categories(budgetId))
  const { data: expenses } = useSuspenseQuery(budgetQueries.expenses(budgetId, { month, categoryId: category }))
  const [editing, setEditing] = useState<Expense>()

  const canEdit = hasRole(budget.role, 'editor')
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="grid gap-4">
      <MonthSwitcher month={month} from="/budgets/$budgetId/expenses" />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dépenses</h1>
          <p className="text-muted-foreground text-sm">
            {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-2xl font-bold tabular-nums">{formatMoney(total)}</p>
      </div>

      <CategoryFilter categories={categories} selected={category} />

      {expenses.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
          <ReceiptText className="size-10 opacity-50" />
          <p>Aucune dépense pour cette période.</p>
        </div>
      ) : (
        <ExpensesByDay expenses={expenses} onSelect={canEdit ? setEditing : undefined} />
      )}

      {canEdit && (
        <ExpenseDrawer
          budgetId={budgetId}
          expense={editing}
          open={editing !== undefined}
          onOpenChange={(open) => !open && setEditing(undefined)}
        />
      )}
    </div>
  )
}
