import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLE_LABELS } from '@/features/budget/budget.constants'
import { type BudgetDetail, budgetQueries } from '@/features/budget/budget.queries'

export function BudgetSwitcher({ current }: { current: BudgetDetail }) {
  const { data: budgets = [] } = useQuery(budgetQueries.mine())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="-ml-2 h-11 min-w-0 gap-2 px-2">
          <img src="/favicon.svg" alt="" className="size-7" />
          <span className="truncate text-base font-semibold">{current.name}</span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Mes budgets</DropdownMenuLabel>
        {budgets.map((budget) => (
          <DropdownMenuItem key={budget.id} asChild>
            <Link to="/budgets/$budgetId" params={{ budgetId: budget.id }} className="flex items-center gap-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate">{budget.name}</span>
                <span className="text-muted-foreground text-xs">{ROLE_LABELS[budget.role]}</span>
              </span>
              {budget.id === current.id && <Check className="text-primary" />}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/onboarding">
            <Plus />
            Nouveau budget
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
