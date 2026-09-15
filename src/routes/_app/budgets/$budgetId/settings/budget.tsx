import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { budgetQueries } from '@/features/budget/budget.queries'
import { DangerZoneCard } from '@/features/settings/components/danger-zone-card'
import { RenameBudgetCard } from '@/features/settings/components/rename-budget-card'

export const Route = createFileRoute('/_app/budgets/$budgetId/settings/budget')({
  // Pure management forms: data is loaded on the server, the page itself renders on the client.
  ssr: 'data-only',
  head: () => ({ meta: [{ title: 'Budget — Budgeto' }] }),
  component: BudgetSettingsPage,
})

function BudgetSettingsPage() {
  const { budgetId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { data: budget } = useSuspenseQuery(budgetQueries.detail(budgetId))

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Budget"
        description={budget.name}
        back={{ to: '/budgets/$budgetId/settings', params: { budgetId } }}
      />
      {budget.role === 'owner' && <RenameBudgetCard key={budget.name} budgetId={budgetId} name={budget.name} />}
      <DangerZoneCard budget={budget} user={user} />
    </div>
  )
}
