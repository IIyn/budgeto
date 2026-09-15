import { useSelector } from '@tanstack/react-store'
import type { CategoryKind } from '@/features/budget/budget.schemas'
import { formatMoney } from '@/lib/money'
import { onboardingStore } from '../onboarding.store'
import { AddCategoryInput } from './add-category-input'
import { CategoryToggleRow } from './category-toggle-row'

const COPY = {
  fixed: {
    hint: 'Activez vos charges et indiquez leur montant mensuel.',
    totalLabel: 'Total des charges fixes',
    addPlaceholder: 'Autre charge (crèche, cantine…)',
    amountPlaceholder: 'Montant mensuel',
  },
  flexible: {
    hint: 'Une estimation aide à proposer une meilleure répartition, mais elle est facultative.',
    totalLabel: 'Estimations',
    addPlaceholder: 'Autre poste (animaux, cadeaux…)',
    amountPlaceholder: 'Estimation (facultatif)',
  },
} as const

/** Shared by the "fixed charges" and "daily expenses" steps: pick presets, set amounts, add custom lines. */
export function CategoriesStep({ kind }: { kind: CategoryKind }) {
  const categories = useSelector(onboardingStore, (draft) => draft.categories.filter((c) => c.kind === kind), {
    compare: (a, b) => a.length === b.length && a.every((category, index) => category === b[index]),
  })
  const { toggleCategory, updateCategory, addCategory } = onboardingStore.actions
  const copy = COPY[kind]
  const amountField = kind === 'fixed' ? 'monthlyAmount' : 'estimate'
  const total = categories.filter((c) => c.selected).reduce((sum, c) => sum + c[amountField], 0)

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-muted-foreground text-sm">{copy.hint}</p>
        <p className="shrink-0 text-right">
          <span className="text-muted-foreground block text-xs">{copy.totalLabel}</span>
          <span className="font-bold tabular-nums">{formatMoney(total)}</span>
        </p>
      </div>

      {categories.map((category) => (
        <CategoryToggleRow
          key={category.id}
          category={category}
          amountField={amountField}
          amountPlaceholder={copy.amountPlaceholder}
          onToggle={() => toggleCategory(category.id)}
          onAmountChange={(cents) => updateCategory(category.id, { [amountField]: cents })}
        />
      ))}

      <AddCategoryInput placeholder={copy.addPlaceholder} onAdd={(name) => addCategory(kind, name)} />
    </div>
  )
}
