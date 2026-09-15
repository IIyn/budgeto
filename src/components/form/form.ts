import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'
import { MoneyField } from './money-field'
import { SubmitButton } from './submit-button'
import { TextField } from './text-field'

/**
 * App-wide TanStack Form hook with pre-bound field components:
 * `<form.AppField name="label">{(field) => <field.TextField label="Libellé" />}</form.AppField>`
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, MoneyField },
  formComponents: { SubmitButton },
})
