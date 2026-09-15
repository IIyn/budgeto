import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { budgetQueries } from '@/features/budget/budget.queries'
import { InviteCard } from '@/features/members/components/invite-card'
import { MembersCard } from '@/features/members/components/members-card'

export const Route = createFileRoute('/_app/budgets/$budgetId/settings/members')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(budgetQueries.members(params.budgetId)),
  head: () => ({ meta: [{ title: 'Membres — Budgeto' }] }),
  component: MembersPage,
})

function MembersPage() {
  const { budgetId } = Route.useParams()
  const { data: budget } = useSuspenseQuery(budgetQueries.detail(budgetId))
  const { data: members } = useSuspenseQuery(budgetQueries.members(budgetId))
  const isOwner = budget.role === 'owner'

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Membres"
        description="Partagez ce budget avec vos proches"
        back={{ to: '/budgets/$budgetId/settings', params: { budgetId } }}
      />
      {isOwner && <InviteCard budgetId={budgetId} budgetName={budget.name} />}
      <MembersCard budgetId={budgetId} members={members} canManage={isOwner} />
    </div>
  )
}
