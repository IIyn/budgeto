import { type ComponentProps, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { parseMoneyInput, toEuros } from '@/lib/money'
import { cn } from '@/lib/utils'

type MoneyInputProps = {
  /** Amount in cents. */
  value: number
  onValueChange: (cents: number) => void
} & Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'>

const display = (cents: number) => (cents === 0 ? '' : String(toEuros(cents)).replace('.', ','))

/** Free-typing euro input (`12,50`) that exposes its value in cents. */
export function MoneyInput({ value, onValueChange, className, onBlur, ...props }: MoneyInputProps) {
  const [text, setText] = useState(() => display(value))

  // Keep the text in sync when the value is changed from outside (slider, reset...).
  useEffect(() => {
    setText((current) => (parseMoneyInput(current) ?? 0) === value ? current : display(value))
  }, [value])

  return (
    <div className="relative">
      <Input
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        value={text}
        onChange={(event) => {
          const next = event.target.value
          const cents = parseMoneyInput(next)
          if (next !== '' && cents === null) return
          setText(next)
          onValueChange(Math.max(0, cents ?? 0))
        }}
        onBlur={(event) => {
          setText(display(value))
          onBlur?.(event)
        }}
        className={cn('h-11 pr-8 text-right tabular-nums', className)}
        {...props}
      />
      <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
        €
      </span>
    </div>
  )
}
