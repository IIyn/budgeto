import { ChevronDown, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { type CategoryIconName, INCOME_ICON } from '@/features/budget/budget.constants'
import { CategoryIcon } from '@/features/budget/components/category-icon'
import { IconPicker } from '@/features/budget/components/icon-picker'
import type { OperationKind } from '@/features/budget/budget.schemas'
import { cn } from '@/lib/utils'

type ExpenseIconFieldProps = {
  /** Icon chosen for the expense, or `null` to follow the category icon. */
  value: CategoryIconName | null
  /** Icon of the selected category, shown while no icon is chosen. */
  categoryIcon: string | undefined
  /** Incomes have no category: they fall back to a fixed icon instead. */
  kind?: OperationKind
  onChange: (icon: CategoryIconName | null) => void
}

/** Collapsed by default to keep the drawer short: most expenses simply use their category icon. */
export function ExpenseIconField({ value, categoryIcon, kind = 'expense', onChange }: ExpenseIconFieldProps) {
  const [open, setOpen] = useState(value !== null)
  const isIncome = kind === 'income'
  const defaultIcon = isIncome ? INCOME_ICON : categoryIcon
  const defaultName = isIncome ? "l'icône par défaut" : "l'icône de la catégorie"

  return (
    <div className="grid gap-2">
      <Label>Icône</Label>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="expense-icon-picker"
        className="bg-card hover:bg-accent/60 flex items-center gap-3 rounded-xl border p-2 text-left transition-colors"
      >
        <CategoryIcon
          icon={value ?? defaultIcon}
          tone={isIncome ? 'income' : value || categoryIcon ? 'flexible' : 'neutral'}
        />
        <span className="flex-1 text-sm">
          <span className="block font-medium">{value ? 'Icône personnalisée' : isIncome ? 'Icône par défaut' : 'Icône de la catégorie'}</span>
          <span className="text-muted-foreground block text-xs">
            {open ? 'Choisissez une icône ci-dessous' : 'Appuyez pour en choisir une autre'}
          </span>
        </span>
        <ChevronDown className={cn('text-muted-foreground size-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div id="expense-icon-picker" className="grid gap-2">
          <IconPicker value={value} onChange={onChange} />
          {value && (
            <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => onChange(null)}>
              <RotateCcw />
              Utiliser {defaultName}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
