import { cn } from '@/lib/utils'
import { CATEGORY_ICON_LABELS, CATEGORY_ICON_NAMES, type CategoryIconName } from '../budget.constants'
import { CATEGORY_ICONS } from './category-icon'

type IconPickerProps = {
  /** `null` means no icon is explicitly selected. */
  value: CategoryIconName | null
  onChange: (icon: CategoryIconName) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8" role="radiogroup" aria-label="Icône">
      {CATEGORY_ICON_NAMES.map((name) => {
        const Icon = CATEGORY_ICONS[name]
        const selected = name === value
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={CATEGORY_ICON_LABELS[name]}
            title={CATEGORY_ICON_LABELS[name]}
            onClick={() => onChange(name)}
            className={cn(
              'flex aspect-square items-center justify-center rounded-xl border transition-colors',
              selected ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
            )}
          >
            <Icon className="size-5" />
          </button>
        )
      })}
    </div>
  )
}
