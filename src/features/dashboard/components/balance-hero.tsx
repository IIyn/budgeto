import { ArrowDownRight, ArrowUpRight, Receipt } from 'lucide-react'
import type { MonthOverview } from '@/features/budget/budget.queries'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'

type Summary = MonthOverview['summary']

/** The key numbers of the month: what is left to live on, and how it is computed. */
export function BalanceHero({ summary }: { summary: Summary }) {
  const overspent = summary.remaining < 0
  const used = summary.afterFixed > 0 ? Math.min(100, (summary.spent / summary.afterFixed) * 100) : 100

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl p-5 text-white shadow-xl',
        overspent
          ? 'bg-linear-to-br from-rose-500 to-orange-500 shadow-rose-500/25'
          : 'from-primary shadow-primary/25 bg-linear-to-br to-fuchsia-500',
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10" />
      <p className="text-sm text-white/80">Reste à vivre ce mois-ci</p>
      <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">{formatMoney(summary.remaining)}</p>
      <p className="mt-1 text-sm text-white/80">
        sur {formatMoney(summary.afterFixed, { compact: true })} disponibles après les charges
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25" aria-hidden>
        <div className="h-full rounded-full bg-white transition-all" style={{ width: `${used}%` }} />
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <Stat icon={ArrowUpRight} label="Ressources" value={summary.income} />
        <Stat icon={Receipt} label="Charges fixes" value={summary.fixed} />
        <Stat icon={ArrowDownRight} label="Dépensé" value={summary.spent} />
      </dl>
    </section>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Receipt; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
      <dt className="flex items-center gap-1 text-xs text-white/80">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1 font-semibold tabular-nums">{formatMoney(value, { compact: true })}</dd>
    </div>
  )
}
