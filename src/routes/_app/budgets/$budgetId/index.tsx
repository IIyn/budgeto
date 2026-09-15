import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MonthSwitcher } from '@/components/layout/month-switcher'
import { budgetQueries } from '@/features/budget/budget.queries'
import { hasRole } from '@/features/budget/budget.logic'
import { BalanceHero } from '@/features/dashboard/components/balance-hero'
import { EnvelopesCard } from '@/features/dashboard/components/envelopes-card'
import { FixedChargesCard } from '@/features/dashboard/components/fixed-charges-card'
import { InviteBanner } from '@/features/dashboard/components/invite-banner'
import { RECENT_EXPENSES_LIMIT, RecentExpensesCard } from '@/features/dashboard/components/recent-expenses-card'
import { currentMonth, monthSchema } from '@/lib/month'

const dashboardSearchSchema = z.object({
  month: monthSchema.optional().catch(undefined),
  welcome: z.boolean().optional().catch(undefined),
})

export const Route = createFileRoute('/_app/budgets/$budgetId/')({
  validateSearch: dashboardSearchSchema,
  loaderDeps: ({ search }) => ({ month: search.month ?? currentMonth() }),
  loader: async ({ context, params, deps }) => {
    // Balances are awaited: they are part of the first HTML chunk.
    await context.queryClient.ensureQueryData(budgetQueries.overview(params.budgetId, deps.month))
    // Not awaited: the recent expenses are streamed to the client once resolved.
    void context.queryClient.prefetchQuery(
      budgetQueries.expenses(params.budgetId, { month: deps.month, limit: RECENT_EXPENSES_LIMIT }),
    )
    return deps
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { budgetId } = Route.useParams()
  const { month } = Route.useLoaderData()
  const { welcome = false } = Route.useSearch()
  const { data: budget } = useSuspenseQuery(budgetQueries.detail(budgetId))
  const { data: overview } = useSuspenseQuery(budgetQueries.overview(budgetId, month))
  const { summary } = overview

  const showInvite = budget.role === 'owner' && (welcome || budget.memberCount === 1)

  return (
    <div className="grid gap-4">
      <MonthSwitcher month={month} from="/budgets/$budgetId/" />
      <BalanceHero summary={summary} />
      {showInvite && <InviteBanner budgetId={budgetId} welcome={welcome} />}
      <EnvelopesCard
        budgetId={budgetId}
        month={month}
        envelopes={summary.envelopes}
        uncategorizedSpent={summary.uncategorizedSpent}
      />
      <RecentExpensesCard budgetId={budgetId} month={month} canEdit={hasRole(budget.role, 'editor')} />
      <FixedChargesCard budgetId={budgetId} charges={overview.fixedCharges} total={summary.fixed} />
    </div>
  )
}
