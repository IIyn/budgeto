import { createFileRoute, redirect } from '@tanstack/react-router'
import { authQueries } from '@/features/auth/auth.queries'
import { budgetQueries } from '@/features/budget/budget.queries'

/** Entry point: sends the visitor to login, onboarding, or their budget. Never renders. */
export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authQueries.currentUser())
    if (!user) throw redirect({ to: '/login' })

    const budgets = await context.queryClient.fetchQuery(budgetQueries.mine())
    const [first] = budgets
    if (!first) throw redirect({ to: '/onboarding' })

    throw redirect({ to: '/budgets/$budgetId', params: { budgetId: first.id } })
  },
})
