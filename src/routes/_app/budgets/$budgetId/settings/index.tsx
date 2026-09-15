import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PiggyBank, Receipt, Users, Wallet, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE_LABELS } from '@/features/budget/budget.constants'
import { budgetQueries } from '@/features/budget/budget.queries'
import { SettingsLink } from '@/features/settings/components/settings-link'
import { ThemeSwitcher } from '@/features/theme/theme-switcher'

export const Route = createFileRoute('/_app/budgets/$budgetId/settings/')({
  head: () => ({ meta: [{ title: 'Réglages — Budgeto' }] }),
  component: SettingsPage,
})

function SettingsPage() {
  const { budgetId } = Route.useParams()
  const { data: budget } = useSuspenseQuery(budgetQueries.detail(budgetId))
  const params = { budgetId }

  return (
    <div className="grid gap-4">
      <PageHeader title="Réglages" description={`${budget.name} · ${ROLE_LABELS[budget.role]}`} />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="divide-y">
          <SettingsLink
            to="/budgets/$budgetId/settings/incomes"
            params={params}
            icon={Wallet}
            title="Ressources mensuelles"
            description="Salaires, aides, revenus réguliers"
            tone="bg-chart-2/15 text-chart-2"
          />
          <SettingsLink
            to="/budgets/$budgetId/settings/categories"
            params={params}
            search={{ kind: 'fixed' }}
            icon={Receipt}
            title="Charges fixes"
            description="Loyer, factures, assurances, abonnements"
            tone="bg-chart-5/15 text-chart-5"
          />
          <SettingsLink
            to="/budgets/$budgetId/settings/categories"
            params={params}
            search={{ kind: 'flexible' }}
            icon={PiggyBank}
            title="Enveloppes"
            description="Courses, loisirs, épargne…"
          />
          <SettingsLink
            to="/budgets/$budgetId/settings/members"
            params={params}
            icon={Users}
            title="Membres & invitations"
            description={`${budget.memberCount} membre${budget.memberCount > 1 ? 's' : ''}`}
            tone="bg-chart-4/15 text-chart-4"
          />
          <SettingsLink
            to="/budgets/$budgetId/settings/budget"
            params={params}
            icon={Wrench}
            title="Budget"
            description="Renommer, quitter ou supprimer"
            tone="bg-muted text-muted-foreground"
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>
    </div>
  )
}
