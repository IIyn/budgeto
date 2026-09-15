import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { useAppForm } from '@/components/form/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { loginFn } from '../auth.functions'
import { loginSchema } from '../auth.schemas'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const login = useMutation({
    mutationFn: loginFn,
    onSuccess: async () => {
      queryClient.clear()
      await router.navigate({ href: redirectTo ?? '/' })
    },
  })

  const form = useAppForm({
    defaultValues: { username: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: ({ value }) => login.mutateAsync({ data: value }).catch(() => undefined),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Connexion</CardTitle>
        <CardDescription>Heureux de vous revoir !</CardDescription>
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
              <field.TextField label="Identifiant" autoComplete="username" autoCapitalize="none" autoFocus />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => <field.TextField label="Mot de passe" type="password" autoComplete="current-password" />}
          </form.AppField>
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <form.AppForm>
            <form.SubmitButton className="w-full">Se connecter</form.SubmitButton>
          </form.AppForm>
          <p className="text-muted-foreground text-sm">
            Pas encore de compte ?{' '}
            <Link to="/signup" search={{ redirect: redirectTo }} className="text-primary font-medium">
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
