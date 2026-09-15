import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { budgetQueries, type Category } from '@/features/budget/budget.queries'
import { hasRole } from '@/features/budget/budget.logic'
import { categoryKindSchema } from '@/features/budget/budget.schemas'
import { AllocationChart } from '@/features/budget/components/allocation-chart'
import { CategoryIcon } from '@/features/budget/components/category-icon'
import { CategoryDrawer } from '@/features/settings/components/category-drawer'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'

const categoriesSearchSchema = z.object({
  kind: categoryKindSchema.default('fixed').catch('fixed'),
})

const TABS = [
  { kind: 'fixed', label: 'Charges fixes' },
  { kind: 'flexible', label: 'Enveloppes' },
] as const

export const Route = createFileRoute('/_app/budgets/$budgetId/settings/categories')({
  validateSearch: categoriesSearchSchema,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(budgetQueries.categories(params.budgetId)),
      context.queryClient.ensureQueryData(budgetQueries.incomes(params.budgetId)),
    ]),
  head: () => ({ meta: [{ title: 'Dépenses mensuelles — Budgeto' }] }),
  component: CategoriesPage,
})

function CategoriesPage() {
  const { budgetId } = Route.useParams()
  const { kind } = Route.useSearch()
  const { data: budget } = useSuspenseQuery(budgetQueries.detail(budgetId))
  const { data: categories } = useSuspenseQuery(budgetQueries.categories(budgetId))
  const { data: incomes } = useSuspenseQuery(budgetQueries.incomes(budgetId))
  const [drawer, setDrawer] = useState<{ category?: Category } | null>(null)

  const canEdit = hasRole(budget.role, 'editor')
  const income = incomes.reduce((sum, i) => sum + i.amount, 0)
  const fixed = categories.filter((c) => c.kind === 'fixed').reduce((sum, c) => sum + c.monthlyAmount, 0)
  const envelopes = categories.filter((c) => c.kind === 'flexible')
  const visible = categories.filter((c) => c.kind === kind)

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Dépenses mensuelles"
        description={`Ressources : ${formatMoney(income)}`}
        back={{ to: '/budgets/$budgetId/settings', params: { budgetId } }}
      />

      <Card>
        <CardContent>
          <AllocationChart
            income={income}
            fixed={fixed}
            envelopes={envelopes.map((e) => ({ key: e.id, label: e.name, amount: e.monthlyAmount }))}
          />
        </CardContent>
      </Card>

      <div className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.kind}
            from={Route.fullPath}
            to="."
            search={{ kind: tab.kind }}
            replace
            className={cn(
              'rounded-lg py-2 text-center text-sm font-medium transition-colors',
              kind === tab.kind ? 'bg-background shadow-sm' : 'text-muted-foreground',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card className="gap-0 py-1">
        {visible.length === 0 && <p className="text-muted-foreground p-4 text-sm">Rien pour le moment.</p>}
        <ul className="divide-y">
          {visible.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setDrawer({ category })}
                className="hover:bg-accent/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors disabled:hover:bg-transparent"
              >
                <CategoryIcon icon={category.icon} tone={category.kind} />
                <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>
                <span className="font-semibold tabular-nums">{formatMoney(category.monthlyAmount)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {canEdit && (
        <>
          <Button size="lg" variant="outline" onClick={() => setDrawer({})}>
            <Plus />
            {kind === 'fixed' ? 'Ajouter une charge fixe' : 'Ajouter une enveloppe'}
          </Button>
          <CategoryDrawer
            budgetId={budgetId}
            category={drawer?.category}
            defaultKind={kind}
            open={drawer !== null}
            onOpenChange={(open) => !open && setDrawer(null)}
          />
        </>
      )}
    </div>
  )
}
