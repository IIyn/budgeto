import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { FieldShell } from './field-shell'
import { useFieldContext } from './form-context'

type TextFieldProps = {
  label: string
  description?: string
} & Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'onBlur' | 'name' | 'id'>

export function TextField({ label, description, className, ...inputProps }: TextFieldProps) {
  const field = useFieldContext<string>()
  const invalid = field.state.meta.isTouched && field.state.meta.errors.length > 0

  return (
    <FieldShell
      id={field.name}
      label={label}
      description={description}
      errors={field.state.meta.isTouched ? field.state.meta.errors : []}
    >
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${field.name}-error` : undefined}
        className={className ?? 'h-11'}
        {...inputProps}
      />
    </FieldShell>
  )
}
