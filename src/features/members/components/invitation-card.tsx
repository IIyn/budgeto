import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { CalendarX2, PartyPopper } from 'lucide-react'
import { UserAvatar } from '@/components/layout/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { SessionUser } from '@/features/auth/auth.schemas'
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/features/budget/budget.constants'
import { acceptInvitationFn, type getInvitationFn } from '../members.functions'

type Invitation = NonNullable<Awaited<ReturnType<typeof getInvitationFn>>>

type InvitationCardProps = {
  token: string
  invitation: Invitation | null
  user: SessionUser | null
}

export function InvitationCard({ token, invitation, user }: InvitationCardProps) {
  if (!invitation || invitation.expired) return <InvalidInvitation />

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="bg-primary/12 text-primary mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl">
          <PartyPopper className="size-7" />
        </div>
        <CardTitle className="text-xl">Vous êtes invité·e !</CardTitle>
        <CardDescription>
          <strong className="text-foreground">{invitation.inviterName}</strong> vous invite à rejoindre le budget
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="bg-muted flex items-center gap-3 rounded-2xl p-4">
          <UserAvatar name={invitation.budgetName} className="size-11" />
          <div>
            <p className="font-semibold">{invitation.budgetName}</p>
            <p className="text-muted-foreground text-sm">
              {ROLE_LABELS[invitation.role]} · {ROLE_DESCRIPTIONS[invitation.role]}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {user ? (
          <AcceptButton token={token} user={user} />
        ) : (
          <>
            <Button size="lg" className="w-full" asChild>
              <Link to="/signup" search={{ redirect: `/invite/${token}` }}>
                Créer un compte et rejoindre
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link to="/login" search={{ redirect: `/invite/${token}` }}>
                J'ai déjà un compte
              </Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

function AcceptButton({ token, user }: { token: string; user: SessionUser }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const accept = useMutation({
    mutationFn: acceptInvitationFn,
    onSuccess: async ({ budgetId }) => {
      await queryClient.invalidateQueries({ queryKey: ['budgets'] })
      await router.navigate({ to: '/budgets/$budgetId', params: { budgetId } })
    },
  })

  return (
    <>
      <Button
        size="lg"
        className="w-full"
        disabled={accept.isPending}
        onClick={() => accept.mutate({ data: { token } })}
      >
        Rejoindre le budget
      </Button>
      <p className="text-muted-foreground text-center text-xs">Connecté en tant que @{user.username}</p>
    </>
  )
}

function InvalidInvitation() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="bg-muted text-muted-foreground mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl">
          <CalendarX2 className="size-7" />
        </div>
        <CardTitle>Invitation invalide</CardTitle>
        <CardDescription>
          Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien à la personne qui vous a invité·e.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/">Aller à l'accueil</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
