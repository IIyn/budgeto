import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { z } from 'zod'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { budgetQueries } from '@/features/budget/budget.queries'

export const Route = createFileRoute('/_app/budgets/$budgetId')({
  params: {
    parse: ({ budgetId }) => {
      const parsed = z.uuid().safeParse(budgetId)
      if (!parsed.success) throw notFound()
      return { budgetId: parsed.data }
    },
  },
  loader: async ({ context, params }) => {
    try {
      const budget = await context.queryClient.ensureQueryData(budgetQueries.detail(params.budgetId))
      return { budgetName: budget.name }
    } catch {
      throw notFound()
    }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.budgetName} — Budgeto` : 'Budgeto' }],
  }),
  component: BudgetLayout,
})

function BudgetLayout() {
  const { budgetId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { data: budget } = useSuspenseQuery(budgetQueries.detail(budgetId))

  return (
    <div className="min-h-dvh pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <AppHeader budget={budget} user={user} />
      <main className="mx-auto w-full max-w-2xl px-4 py-4">
        <Outlet />
      </main>
      <BottomNav budget={budget} />
    </div>
  )
}
