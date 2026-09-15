import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { changePasswordFn } from '../profile.functions'
import { changePasswordSchema } from '../profile.schemas'

const emptyValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function PasswordCard() {
  const changePassword = useMutation({
    mutationFn: changePasswordFn,
    onSuccess: () => {
      form.reset(emptyValues)
      toast.success('Mot de passe modifié. Vos autres appareils ont été déconnectés.')
    },
  })

  const form = useAppForm({
    defaultValues: emptyValues,
    validators: { onSubmit: changePasswordSchema },
    onSubmit: ({ value }) => changePassword.mutateAsync({ data: value }).catch(() => undefined),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe</CardTitle>
        <CardDescription>Le changer déconnecte vos autres appareils.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          method="post"
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="currentPassword">
            {(field) => <field.TextField label="Mot de passe actuel" type="password" autoComplete="current-password" />}
          </form.AppField>
          <form.AppField name="newPassword">
            {(field) => <field.TextField label="Nouveau mot de passe" type="password" autoComplete="new-password" />}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => <field.TextField label="Confirmer" type="password" autoComplete="new-password" />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton variant="secondary">Changer le mot de passe</form.SubmitButton>
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  )
}
