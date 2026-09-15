import type { BudgetDetail } from '@/features/budget/budget.queries'
import type { SessionUser } from '@/features/auth/auth.schemas'
import { BudgetSwitcher } from './budget-switcher'
import { UserMenu } from './user-menu'

type AppHeaderProps = {
  budget: BudgetDetail
  user: SessionUser
}

export function AppHeader({ budget, user }: AppHeaderProps) {
  return (
    <header className="bg-background/80 sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur-lg">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
        <BudgetSwitcher current={budget} />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
