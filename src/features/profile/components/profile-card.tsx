import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authQueries } from '@/features/auth/auth.queries'
import type { SessionUser } from '@/features/auth/auth.schemas'
import { updateProfileFn } from '../profile.functions'
import { updateProfileSchema } from '../profile.schemas'

export function ProfileCard({ user }: { user: SessionUser }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: updateProfileFn,
    onSuccess: async () => {
      // The user is read from the router context, so refresh the cached user before re-running loaders.
      await queryClient.refetchQueries({ queryKey: authQueries.currentUser().queryKey })
      await queryClient.invalidateQueries()
      await router.invalidate()
      toast.success('Profil mis à jour')
    },
  })

  const form = useAppForm({
    defaultValues: { displayName: user.displayName },
    validators: { onSubmit: updateProfileSchema },
    onSubmit: ({ value }) => update.mutateAsync({ data: value }).catch(() => undefined),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Identifiant de connexion : @{user.username}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="displayName">
            {(field) => (
              <field.TextField
                label="Nom ou pseudo"
                description="Visible par les membres de vos budgets."
                autoComplete="nickname"
                maxLength={60}
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton>Enregistrer</form.SubmitButton>
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  )
}
