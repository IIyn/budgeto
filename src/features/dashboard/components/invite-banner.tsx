import { Link } from '@tanstack/react-router'
import { Sparkles, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type InviteBannerProps = {
  budgetId: string
  welcome: boolean
}

export function InviteBanner({ budgetId, welcome }: InviteBannerProps) {
  return (
    <section className="bg-accent text-accent-foreground flex items-center gap-4 rounded-2xl p-4">
      <div className="bg-background/60 flex size-11 shrink-0 items-center justify-center rounded-xl">
        {welcome ? <Sparkles className="size-5" /> : <UserPlus className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{welcome ? 'Votre budget est prêt !' : 'Budget à plusieurs ?'}</p>
        <p className="text-sm opacity-80">Invitez un proche pour le gérer ensemble.</p>
      </div>
      <Button size="sm" asChild>
        <Link to="/budgets/$budgetId/settings/members" params={{ budgetId }}>
          Inviter
        </Link>
      </Button>
    </section>
  )
}
