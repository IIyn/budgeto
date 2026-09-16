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
  head: () => ({ meta: [{ title: 'Opérations — Budgeto' }] }),
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
  const spent = expenses.filter((e) => e.kind === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const received = expenses.filter((e) => e.kind === 'income').reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="grid gap-4">
      <MonthSwitcher month={month} from="/budgets/$budgetId/expenses" />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Opérations</h1>
          <p className="text-muted-foreground text-sm">
            {expenses.length} opération{expenses.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">{spent > 0 && '−'}{formatMoney(spent)}</p>
          {received > 0 && <p className="text-success text-sm font-medium tabular-nums">+{formatMoney(received)}</p>}
        </div>
      </div>

      <CategoryFilter categories={categories} selected={category} />

      {expenses.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
          <ReceiptText className="size-10 opacity-50" />
          <p>Aucune opération pour cette période.</p>
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
