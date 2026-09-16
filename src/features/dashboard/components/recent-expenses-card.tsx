import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Suspense, useState } from 'react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { budgetQueries, type Expense } from '@/features/budget/budget.queries'
import { ExpenseDrawer } from '@/features/expenses/components/expense-drawer'
import { ExpenseRow } from '@/features/expenses/components/expense-row'
import type { Month } from '@/lib/month'

export const RECENT_EXPENSES_LIMIT = 5

type RecentExpensesCardProps = {
  budgetId: string
  month: Month
  canEdit: boolean
}

export function RecentExpensesCard({ budgetId, month, canEdit }: RecentExpensesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dernières opérations</CardTitle>
        <CardAction>
          <Link to="/budgets/$budgetId/expenses" params={{ budgetId }} search={{ month }} className="text-primary text-sm font-medium">
            Tout voir
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<RecentExpensesSkeleton />}>
          <RecentExpensesList budgetId={budgetId} month={month} canEdit={canEdit} />
        </Suspense>
      </CardContent>
    </Card>
  )
}

/** Suspends until the expenses query resolves: during SSR its result is streamed after the shell. */
function RecentExpensesList({ budgetId, month, canEdit }: RecentExpensesCardProps) {
  const { data: expenses } = useSuspenseQuery(budgetQueries.expenses(budgetId, { month, limit: RECENT_EXPENSES_LIMIT }))
  const [editing, setEditing] = useState<Expense>()

  if (expenses.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucune opération ce mois-ci. Appuyez sur + pour en ajouter une.</p>
  }

  return (
    <>
      <div className="grid">
        {expenses.map((expense) => (
          <ExpenseRow key={expense.id} expense={expense} onSelect={canEdit ? setEditing : undefined} />
        ))}
      </div>
      {canEdit && (
        <ExpenseDrawer
          budgetId={budgetId}
          expense={editing}
          open={editing !== undefined}
          onOpenChange={(open) => !open && setEditing(undefined)}
        />
      )}
    </>
  )
}

function RecentExpensesSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}
