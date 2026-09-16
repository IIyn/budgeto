import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { OperationKind } from '@/features/budget/budget.schemas'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { kind: 'expense', label: 'Dépense', icon: ArrowDownRight },
  { kind: 'income', label: "Entrée d'argent", icon: ArrowUpRight },
] as const

type OperationKindSwitchProps = {
  value: OperationKind
  onChange: (kind: OperationKind) => void
}

export function OperationKindSwitch({ value, onChange }: OperationKindSwitchProps) {
  return (
    <div className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1" role="radiogroup" aria-label="Type d'opération">
      {OPTIONS.map(({ kind, label, icon: Icon }) => {
        const selected = value === kind
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(kind)}
            className={cn(
              'flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors',
              selected ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
              selected && (kind === 'income' ? 'text-success' : 'text-foreground'),
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
