import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { useAppForm } from '@/components/form/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { signupFn } from '../auth.functions'
import { signupSchema } from '../auth.schemas'

export function SignupForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const signup = useMutation({
    mutationFn: signupFn,
    onSuccess: async () => {
      queryClient.clear()
      // Invited people go back to the invitation, everyone else starts the onboarding.
      await router.navigate({ href: redirectTo ?? '/onboarding' })
    },
  })

  const form = useAppForm({
    defaultValues: { username: '', password: '', confirmPassword: '' },
    validators: { onSubmit: signupSchema },
    onSubmit: ({ value }) => signup.mutateAsync({ data: value }).catch(() => undefined),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Créer un compte</CardTitle>
        <CardDescription>Quelques secondes et votre budget est prêt.</CardDescription>
      </CardHeader>
      <form
        method="post"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <CardContent className="grid gap-4">
          <form.AppField name="username">
            {(field) => (
              <field.TextField
                label="Identifiant"
                description="Sert uniquement à vous connecter."
                autoComplete="username"
                autoCapitalize="none"
                autoFocus
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => <field.TextField label="Mot de passe" type="password" autoComplete="new-password" />}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.TextField label="Confirmer le mot de passe" type="password" autoComplete="new-password" />
            )}
          </form.AppField>
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <form.AppForm>
            <form.SubmitButton className="w-full">Créer mon compte</form.SubmitButton>
          </form.AppForm>
          <p className="text-muted-foreground text-sm">
            Déjà inscrit ?{' '}
            <Link to="/login" search={{ redirect: redirectTo }} className="text-primary font-medium">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
