import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/login-form'

export const Route = createFileRoute('/_auth/login')({
  head: () => ({ meta: [{ title: 'Connexion — Budgeto' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  return <LoginForm redirectTo={redirect} />
}
