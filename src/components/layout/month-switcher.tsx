import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { currentMonth, formatMonth, type Month, shiftMonth } from '@/lib/month'

type MonthSwitcherProps = {
  month: Month
  /** Route whose `month` search param is updated. */
  from: '/budgets/$budgetId/' | '/budgets/$budgetId/expenses'
}

export function MonthSwitcher({ month, from }: MonthSwitcherProps) {
  const isCurrent = month === currentMonth()

  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="ghost" size="icon-lg" asChild>
        <Link from={from} to="." search={(prev) => ({ ...prev, month: shiftMonth(month, -1) })} aria-label="Mois précédent">
          <ChevronLeft />
        </Link>
      </Button>
      <div className="text-center">
        <p className="font-semibold">{formatMonth(month)}</p>
        {!isCurrent && (
          <Link from={from} to="." search={(prev) => ({ ...prev, month: undefined })} className="text-primary text-xs">
            Revenir au mois en cours
          </Link>
        )}
      </div>
      <Button variant="ghost" size="icon-lg" asChild>
        <Link from={from} to="." search={(prev) => ({ ...prev, month: shiftMonth(month, 1) })} aria-label="Mois suivant">
          <ChevronRight />
        </Link>
      </Button>
    </div>
  )
}
