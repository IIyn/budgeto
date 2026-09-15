import { Link } from '@tanstack/react-router'
import { sortEnvelopesFirst } from '@/features/budget/budget.logic'
import type { Category } from '@/features/budget/budget.queries'
import { cn } from '@/lib/utils'

type CategoryFilterProps = {
  categories: Category[]
  selected?: string
}

/** Filter chips backed by the `category` search param, so filters are shareable and survive reloads. */
export function CategoryFilter({ categories, selected }: CategoryFilterProps) {
  const chips = [{ id: undefined, name: 'Toutes' }, ...sortEnvelopesFirst(categories)]

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {chips.map((chip) => (
        <Link
          key={chip.id ?? 'all'}
          from="/budgets/$budgetId/expenses"
          to="."
          search={(prev) => ({ ...prev, category: chip.id })}
          replace
          className={cn(
            'flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors',
            selected === chip.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent',
          )}
        >
          {chip.name}
        </Link>
      ))}
    </div>
  )
}
