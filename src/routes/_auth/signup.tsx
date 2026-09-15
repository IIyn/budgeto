import { createFileRoute } from '@tanstack/react-router'
import { SignupForm } from '@/features/auth/components/signup-form'

export const Route = createFileRoute('/_auth/signup')({
  head: () => ({ meta: [{ title: 'Créer un compte — Budgeto' }] }),
  component: SignupPage,
})

function SignupPage() {
  const { redirect } = Route.useSearch()
  return <SignupForm redirectTo={redirect} />
}
