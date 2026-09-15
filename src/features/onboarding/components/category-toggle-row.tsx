import { MoneyInput } from '@/components/form/money-input'
import { Switch } from '@/components/ui/switch'
import { CategoryIcon } from '@/features/budget/components/category-icon'
import { cn } from '@/lib/utils'
import type { DraftCategory } from '../onboarding.store'

type CategoryToggleRowProps = {
  category: DraftCategory
  /** Which amount the input edits: the fixed charge itself, or an optional spending estimate. */
  amountField: 'monthlyAmount' | 'estimate'
  amountPlaceholder?: string
  onToggle: () => void
  onAmountChange: (cents: number) => void
}

export function CategoryToggleRow({
  category,
  amountField,
  amountPlaceholder,
  onToggle,
  onAmountChange,
}: CategoryToggleRowProps) {
  const switchId = `toggle-${category.id}`

  return (
    <div
      className={cn(
        'bg-card rounded-2xl border p-3 transition-colors',
        category.selected && 'border-primary/40 bg-primary/5',
      )}
    >
      <label htmlFor={switchId} className="flex cursor-pointer items-center gap-3">
        <CategoryIcon icon={category.icon} tone={category.selected ? category.kind : 'neutral'} />
        <span className="flex-1 font-medium">{category.name}</span>
        <Switch id={switchId} checked={category.selected} onCheckedChange={onToggle} />
      </label>
      {category.selected && (
        <div className="mt-3">
          <MoneyInput
            value={category[amountField]}
            onValueChange={onAmountChange}
            placeholder={amountPlaceholder}
            aria-label={`Montant pour ${category.name}`}
          />
        </div>
      )}
    </div>
  )
}
