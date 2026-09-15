import { useMutation } from '@tanstack/react-query'
import { Copy, Link2, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROLE_DESCRIPTIONS } from '@/features/budget/budget.constants'
import type { MemberRole } from '@/features/budget/budget.schemas'
import { createInvitationFn } from '../members.functions'
import { INVITATION_DAYS } from '../members.schemas'
import { useShare } from '../use-share'
import { RoleSelect } from './role-select'

type InviteCardProps = {
  budgetId: string
  budgetName: string
}

export function InviteCard({ budgetId, budgetName }: InviteCardProps) {
  const [role, setRole] = useState<MemberRole>('editor')
  const [link, setLink] = useState<string>()
  const { share, copy, canShare } = useShare()

  const createInvitation = useMutation({
    mutationFn: createInvitationFn,
    onSuccess: ({ token }) => {
      const url = `${window.location.origin}/invite/${token}`
      setLink(url)
      if (canShare) void share(shareData(url))
    },
  })

  const shareData = (url: string) => ({
    title: 'Budgeto',
    text: `Rejoins le budget « ${budgetName} » sur Budgeto`,
    url,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter un proche</CardTitle>
        <CardDescription>
          Créez un lien à usage unique, valable {INVITATION_DAYS} jours, et partagez-le par message.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label>Rôle de la personne invitée</Label>
          <RoleSelect
            label="Rôle de la personne invitée"
            value={role}
            onChange={(next) => {
              setRole(next)
              setLink(undefined)
            }}
            className="h-11 w-full"
          />
          <p className="text-muted-foreground text-sm">{ROLE_DESCRIPTIONS[role]}</p>
        </div>

        {link ? (
          <div className="grid gap-2">
            <Input readOnly value={link} className="h-11 font-mono text-xs" onFocus={(e) => e.target.select()} />
            <div className="flex gap-2">
              <Button size="lg" className="flex-1" onClick={() => share(shareData(link))}>
                <Share2 />
                {canShare ? 'Partager' : 'Copier le lien'}
              </Button>
              {canShare && (
                <Button size="lg" variant="outline" onClick={() => copy(link)} aria-label="Copier le lien">
                  <Copy />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Button
            size="lg"
            disabled={createInvitation.isPending}
            onClick={() => createInvitation.mutate({ data: { budgetId, role } })}
          >
            <Link2 />
            Créer un lien d'invitation
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
