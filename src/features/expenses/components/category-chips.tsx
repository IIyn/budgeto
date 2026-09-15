import { CircleDashed } from 'lucide-react'
import type { Category } from '@/features/budget/budget.queries'
import { CATEGORY_ICONS } from '@/features/budget/components/category-icon'
import type { CategoryIconName } from '@/features/budget/budget.constants'
import { sortEnvelopesFirst } from '@/features/budget/budget.logic'
import { cn } from '@/lib/utils'

type CategoryChipsProps = {
  categories: Category[]
  value: string | null
  onChange: (categoryId: string | null) => void
}

export function CategoryChips({ categories, value, onChange }: CategoryChipsProps) {
  const sorted = sortEnvelopesFirst(categories)

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Catégorie">
      {sorted.map((category) => (
        <Chip
          key={category.id}
          selected={value === category.id}
          onClick={() => onChange(category.id)}
          icon={CATEGORY_ICONS[category.icon as CategoryIconName] ?? CircleDashed}
          label={category.name}
        />
      ))}
      <Chip selected={value === null} onClick={() => onChange(null)} icon={CircleDashed} label="Sans catégorie" />
    </div>
  )
}

type ChipProps = {
  selected: boolean
  onClick: () => void
  icon: typeof CircleDashed
  label: string
}

function Chip({ selected, onClick, icon: Icon, label }: ChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent',
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
