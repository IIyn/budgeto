import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { LogOut, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmButton } from '@/components/common/confirm-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SessionUser } from '@/features/auth/auth.schemas'
import { deleteBudgetFn } from '@/features/budget/budget.functions'
import type { BudgetDetail } from '@/features/budget/budget.queries'
import { removeMemberFn } from '@/features/members/members.functions'

type DangerZoneCardProps = {
  budget: BudgetDetail
  user: SessionUser
}

export function DangerZoneCard({ budget, user }: DangerZoneCardProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const leaveHome = async (message: string) => {
    queryClient.removeQueries({ queryKey: ['budget', budget.id] })
    await queryClient.invalidateQueries({ queryKey: ['budgets'] })
    toast.success(message)
    await router.navigate({ to: '/' })
  }

  const leave = useMutation({
    mutationFn: removeMemberFn,
    onSuccess: () => leaveHome('Vous avez quitté le budget'),
  })
  const remove = useMutation({
    mutationFn: deleteBudgetFn,
    onSuccess: () => leaveHome('Budget supprimé'),
  })

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle>Zone sensible</CardTitle>
        <CardDescription>Ces actions sont définitives.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <ConfirmButton
          variant="outline"
          size="lg"
          title="Quitter ce budget ?"
          description="Vous n'y aurez plus accès, sauf si quelqu'un vous invite à nouveau."
          confirmLabel="Quitter"
          disabled={leave.isPending}
          onConfirm={() => leave.mutate({ data: { budgetId: budget.id, userId: user.id } })}
        >
          <LogOut />
          Quitter le budget
        </ConfirmButton>
        {budget.role === 'owner' && (
          <ConfirmButton
            variant="destructive"
            size="lg"
            title={`Supprimer « ${budget.name} » ?`}
            description="Toutes les ressources, charges et dépenses seront supprimées pour tous les membres."
            confirmLabel="Supprimer définitivement"
            disabled={remove.isPending}
            onConfirm={() => remove.mutate({ data: { budgetId: budget.id } })}
          >
            <Trash2 />
            Supprimer le budget
          </ConfirmButton>
        )}
      </CardContent>
    </Card>
  )
}
