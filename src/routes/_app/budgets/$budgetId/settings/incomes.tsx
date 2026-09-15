import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { budgetQueries, type Income } from '@/features/budget/budget.queries'
import { hasRole } from '@/features/budget/budget.logic'
import { IncomeDrawer } from '@/features/settings/components/income-drawer'
import { formatMoney } from '@/lib/money'

export const Route = createFileRoute('/_app/budgets/$budgetId/settings/incomes')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(budgetQueries.incomes(params.budgetId)),
  head: () => ({ meta: [{ title: 'Ressources — Budgeto' }] }),
  component: IncomesPage,
})

function IncomesPage() {
  const { budgetId } = Route.useParams()
  const { data: budget } = useSuspenseQuery(budgetQueries.detail(budgetId))
  const { data: incomes } = useSuspenseQuery(budgetQueries.incomes(budgetId))
  const [drawer, setDrawer] = useState<{ income?: Income } | null>(null)

  const canEdit = hasRole(budget.role, 'editor')
  const total = incomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Ressources"
        description={`${formatMoney(total)} par mois`}
        back={{ to: '/budgets/$budgetId/settings', params: { budgetId } }}
      />

      <Card className="gap-0 py-1">
        {incomes.length === 0 && <p className="text-muted-foreground p-4 text-sm">Aucune ressource.</p>}
        <ul className="divide-y">
          {incomes.map((income) => (
            <li key={income.id}>
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setDrawer({ income })}
                className="hover:bg-accent/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors disabled:hover:bg-transparent"
              >
                <span className="bg-chart-2/15 text-chart-2 flex size-10 items-center justify-center rounded-xl">
                  <Wallet className="size-5" />
                </span>
                <span className="flex-1 font-medium">{income.label}</span>
                <span className="font-semibold tabular-nums">{formatMoney(income.amount)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {canEdit && (
        <>
          <Button size="lg" variant="outline" onClick={() => setDrawer({})}>
            <Plus />
            Ajouter une ressource
          </Button>
          <IncomeDrawer
            budgetId={budgetId}
            income={drawer?.income}
            open={drawer !== null}
            onOpenChange={(open) => !open && setDrawer(null)}
          />
        </>
      )}
    </div>
  )
}
