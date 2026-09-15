import { useMutation } from '@tanstack/react-query'
import { UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmButton } from '@/components/common/confirm-button'
import { UserAvatar } from '@/components/layout/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE_LABELS } from '@/features/budget/budget.constants'
import type { Member } from '@/features/budget/budget.queries'
import { useInvalidateBudget } from '@/features/budget/use-invalidate-budget'
import { removeMemberFn, updateMemberRoleFn } from '../members.functions'
import { RoleSelect } from './role-select'

type MembersCardProps = {
  budgetId: string
  members: Member[]
  canManage: boolean
}

export function MembersCard({ budgetId, members, canManage }: MembersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membres</CardTitle>
        <CardDescription>Tous les membres partagent le même budget.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {members.map((member) => (
          <MemberRow key={member.userId} budgetId={budgetId} member={member} canManage={canManage} />
        ))}
      </CardContent>
    </Card>
  )
}

type MemberRowProps = {
  budgetId: string
  member: Member
  canManage: boolean
}

function MemberRow({ budgetId, member, canManage }: MemberRowProps) {
  const invalidate = useInvalidateBudget(budgetId)
  const updateRole = useMutation({
    mutationFn: updateMemberRoleFn,
    onSuccess: async () => {
      await invalidate()
      toast.success('Rôle mis à jour')
    },
  })
  const remove = useMutation({
    mutationFn: removeMemberFn,
    onSuccess: async () => {
      await invalidate()
      toast.success(`${member.displayName} a été retiré du budget`)
    },
  })

  const editable = canManage && !member.isCurrentUser

  return (
    <div className="flex flex-wrap items-center gap-3">
      <UserAvatar name={member.displayName} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate font-medium">
          {member.displayName}
          {member.isCurrentUser && <Badge variant="secondary">Vous</Badge>}
        </p>
        <p className="text-muted-foreground truncate text-sm">@{member.username}</p>
      </div>
      {editable ? (
        <div className="flex items-center gap-1">
          <RoleSelect
            label={`Rôle de ${member.displayName}`}
            value={member.role}
            disabled={updateRole.isPending}
            onChange={(role) => updateRole.mutate({ data: { budgetId, userId: member.userId, role } })}
            className="w-36"
          />
          <ConfirmButton
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={`Retirer ${member.displayName}`}
            title="Retirer ce membre ?"
            description={`${member.displayName} n'aura plus accès à ce budget.`}
            confirmLabel="Retirer"
            onConfirm={() => remove.mutate({ data: { budgetId, userId: member.userId } })}
          >
            <UserMinus />
          </ConfirmButton>
        </div>
      ) : (
        <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
      )}
    </div>
  )
}
