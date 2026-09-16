import { Link } from '@tanstack/react-router'
import { House, type LucideIcon, Plus, ReceiptText, Settings } from 'lucide-react'
import { useState } from 'react'
import type { BudgetDetail } from '@/features/budget/budget.queries'
import { hasRole } from '@/features/budget/budget.logic'
import { ExpenseDrawer } from '@/features/expenses/components/expense-drawer'

export function BottomNav({ budget }: { budget: BudgetDetail }) {
  const [adding, setAdding] = useState(false)
  const canEdit = hasRole(budget.role, 'editor')

  return (
    <>
      <nav className="bg-background/90 fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div className="mx-auto grid h-16 max-w-2xl grid-cols-4 items-center px-2">
          <NavLink to="/budgets/$budgetId" budgetId={budget.id} icon={House} label="Accueil" exact />
          <NavLink to="/budgets/$budgetId/expenses" budgetId={budget.id} icon={ReceiptText} label="Opérations" />
          <NavLink to="/budgets/$budgetId/settings" budgetId={budget.id} icon={Settings} label="Réglages" />
          {canEdit && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="bg-primary text-primary-foreground shadow-primary/30 flex size-13 items-center justify-center rounded-2xl shadow-lg transition active:scale-95"
                aria-label="Ajouter une opération"
              >
                <Plus className="size-6" />
              </button>
            </div>
          )}
        </div>
      </nav>
      {canEdit && <ExpenseDrawer budgetId={budget.id} open={adding} onOpenChange={setAdding} />}
    </>
  )
}

type NavLinkProps = {
  to: '/budgets/$budgetId' | '/budgets/$budgetId/expenses' | '/budgets/$budgetId/settings'
  budgetId: string
  icon: LucideIcon
  label: string
  exact?: boolean
}

function NavLink({ to, budgetId, icon: Icon, label, exact }: NavLinkProps) {
  return (
    <Link
      to={to}
      params={{ budgetId }}
      activeOptions={{ exact, includeSearch: false }}
      className="text-muted-foreground data-[status=active]:text-primary flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors"
    >
      <Icon className="size-5" />
      {label}
    </Link>
  )
}
