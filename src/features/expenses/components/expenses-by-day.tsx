import type { Expense } from '@/features/budget/budget.queries'
import { formatMoney } from '@/lib/money'
import { formatDay } from '@/lib/month'
import { ExpenseRow } from './expense-row'

type ExpensesByDayProps = {
  expenses: Expense[]
  onSelect?: (expense: Expense) => void
}

export function ExpensesByDay({ expenses, onSelect }: ExpensesByDayProps) {
  const days = groupByDay(expenses)

  return (
    <div className="grid gap-5">
      {days.map(([day, items]) => (
        <section key={day}>
          <header className="text-muted-foreground mb-1 flex justify-between text-xs font-medium tracking-wide uppercase">
            <span>{formatDay(day)}</span>
            <span className="tabular-nums">{formatSignedMoney(netAmount(items))}</span>
          </header>
          <div className="bg-card grid rounded-2xl border px-4 py-1">
            {items.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} onSelect={onSelect} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** Incomes count positively, expenses negatively. */
function netAmount(operations: Expense[]) {
  return operations.reduce((total, o) => total + (o.kind === 'income' ? o.amount : -o.amount), 0)
}

function formatSignedMoney(cents: number) {
  return `${cents > 0 ? '+' : cents < 0 ? '−' : ''}${formatMoney(Math.abs(cents))}`
}

function groupByDay(expenses: Expense[]) {
  const groups = new Map<string, Expense[]>()
  for (const expense of expenses) {
    groups.set(expense.spentOn, [...(groups.get(expense.spentOn) ?? []), expense])
  }
  return [...groups.entries()]
}
