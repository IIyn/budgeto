import { Link } from '@tanstack/react-router'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthOverview } from '@/features/budget/budget.queries'
import { CategoryIcon } from '@/features/budget/components/category-icon'
import { formatMoney } from '@/lib/money'

type FixedChargesCardProps = {
  budgetId: string
  charges: MonthOverview['fixedCharges']
  total: number
}

export function FixedChargesCard({ budgetId, charges, total }: FixedChargesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Charges fixes</CardTitle>
        <CardDescription>Déduites automatiquement : {formatMoney(total)}</CardDescription>
        <CardAction>
          <Link
            to="/budgets/$budgetId/settings/categories"
            params={{ budgetId }}
            search={{ kind: 'fixed' }}
            className="text-primary text-sm font-medium"
          >
            Gérer
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {charges.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune charge fixe.</p>
        ) : (
          <ul className="grid gap-2">
            {charges.map((charge) => (
              <li key={charge.id} className="flex items-center gap-3">
                <CategoryIcon icon={charge.icon} tone="fixed" className="size-8 [&_svg]:size-4" />
                <span className="min-w-0 flex-1 truncate text-sm">{charge.name}</span>
                <span className="text-sm font-medium tabular-nums">{formatMoney(charge.monthlyAmount)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
