import { FieldShell } from './field-shell'
import { useFieldContext } from './form-context'
import { MoneyInput } from './money-input'

type MoneyFieldProps = {
  label: string
  description?: string
  autoFocus?: boolean
}

export function MoneyField({ label, description, autoFocus }: MoneyFieldProps) {
  const field = useFieldContext<number>()
  const errors = field.state.meta.isTouched ? field.state.meta.errors : []

  return (
    <FieldShell id={field.name} label={label} description={description} errors={errors}>
      <MoneyInput
        id={field.name}
        name={field.name}
        value={field.state.value}
        onValueChange={field.handleChange}
        onBlur={field.handleBlur}
        aria-invalid={errors.length > 0}
        autoFocus={autoFocus}
      />
    </FieldShell>
  )
}
