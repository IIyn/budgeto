import { Link } from '@tanstack/react-router'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthOverview } from '@/features/budget/budget.queries'
import { CategoryIcon } from '@/features/budget/components/category-icon'
import { formatMoney } from '@/lib/money'
import type { Month } from '@/lib/month'
import { cn } from '@/lib/utils'

type Envelope = MonthOverview['summary']['envelopes'][number]

type EnvelopesCardProps = {
  budgetId: string
  month: Month
  envelopes: Envelope[]
  uncategorizedSpent: number
}

export function EnvelopesCard({ budgetId, month, envelopes, uncategorizedSpent }: EnvelopesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enveloppes</CardTitle>
        <CardDescription>Ce qu'il reste dans chaque poste de dépense</CardDescription>
        <CardAction>
          <Link
            to="/budgets/$budgetId/settings/categories"
            params={{ budgetId }}
            search={{ kind: 'flexible' }}
            className="text-primary text-sm font-medium"
          >
            Ajuster
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-1">
        {envelopes.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucune enveloppe : ajoutez-en depuis les réglages.</p>
        )}
        {envelopes.map((envelope) => (
          <Link
            key={envelope.id}
            to="/budgets/$budgetId/expenses"
            params={{ budgetId }}
            search={{ month, category: envelope.id }}
            className="hover:bg-accent/60 -mx-2 rounded-xl px-2 py-2 transition-colors"
          >
            <EnvelopeRow envelope={envelope} />
          </Link>
        ))}
        {uncategorizedSpent > 0 && (
          <p className="text-muted-foreground mt-2 text-sm">
            + {formatMoney(uncategorizedSpent)} de dépenses sans catégorie
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function EnvelopeRow({ envelope }: { envelope: Envelope }) {
  const ratio = envelope.monthlyAmount > 0 ? envelope.spent / envelope.monthlyAmount : envelope.spent > 0 ? 1.01 : 0
  const tone = ratio > 1 ? 'bg-destructive' : ratio > 0.8 ? 'bg-warning' : 'bg-success'

  return (
    <div className="flex items-center gap-3">
      <CategoryIcon icon={envelope.icon} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">{envelope.name}</span>
          <span className={cn('text-sm font-semibold tabular-nums', envelope.left < 0 && 'text-destructive')}>
            {formatMoney(envelope.left, { compact: true })}
          </span>
        </div>
        <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
          <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
        </div>
        <p className="text-muted-foreground mt-1 text-xs tabular-nums">
          {formatMoney(envelope.spent, { compact: true })} dépensés sur {formatMoney(envelope.monthlyAmount, { compact: true })}
        </p>
      </div>
    </div>
  )
}
