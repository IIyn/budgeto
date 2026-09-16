import { INCOME_ICON } from '@/features/budget/budget.constants'
import type { Expense } from '@/features/budget/budget.queries'
import { CategoryIcon } from '@/features/budget/components/category-icon'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'

type ExpenseRowProps = {
  expense: Expense
  onSelect?: (expense: Expense) => void
}

export function ExpenseRow({ expense, onSelect }: ExpenseRowProps) {
  const isIncome = expense.kind === 'income'
  const content = (
    <>
      {isIncome ? (
        <CategoryIcon icon={expense.icon ?? INCOME_ICON} tone="income" />
      ) : (
        <CategoryIcon
          icon={expense.icon ?? expense.categoryIcon}
          tone={expense.icon || expense.categoryId ? 'flexible' : 'neutral'}
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{expense.label}</span>
        <span className="text-muted-foreground block truncate text-xs">
          {[isIncome ? "Entrée d'argent" : (expense.categoryName ?? 'Sans catégorie'), expense.authorName]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </span>
      <span className={cn('font-semibold tabular-nums', isIncome && 'text-success')}>
        {isIncome ? '+' : '−'}
        {formatMoney(expense.amount)}
      </span>
    </>
  )

  if (!onSelect) return <div className="flex items-center gap-3 py-2">{content}</div>

  return (
    <button
      type="button"
      onClick={() => onSelect(expense)}
      className="hover:bg-accent/60 -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors"
    >
      {content}
    </button>
  )
}
