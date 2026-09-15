import { useMutation } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import type { Income } from '@/features/budget/budget.queries'
import { incomeDraftSchema } from '@/features/budget/budget.schemas'
import { useInvalidateBudget } from '@/features/budget/use-invalidate-budget'
import { deleteIncomeFn, saveIncomeFn } from '../settings.functions'

type IncomeDrawerProps = {
  budgetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  income?: Income
}

export function IncomeDrawer({ budgetId, open, onOpenChange, income }: IncomeDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh]">
        <DrawerHeader>
          <DrawerTitle>{income ? 'Modifier la ressource' : 'Nouvelle ressource'}</DrawerTitle>
          <DrawerDescription>Un revenu qui arrive chaque mois.</DrawerDescription>
        </DrawerHeader>
        {open && <IncomeForm budgetId={budgetId} income={income} onDone={() => onOpenChange(false)} />}
      </DrawerContent>
    </Drawer>
  )
}

function IncomeForm({ budgetId, income, onDone }: { budgetId: string; income?: Income; onDone: () => void }) {
  const invalidate = useInvalidateBudget(budgetId)
  const onSuccess = async (message: string) => {
    await invalidate()
    toast.success(message)
    onDone()
  }

  const save = useMutation({
    mutationFn: saveIncomeFn,
    onSuccess: () => onSuccess(income ? 'Ressource modifiée' : 'Ressource ajoutée'),
  })
  const remove = useMutation({
    mutationFn: deleteIncomeFn,
    onSuccess: () => onSuccess('Ressource supprimée'),
  })

  const form = useAppForm({
    defaultValues: { label: income?.label ?? '', amount: income?.amount ?? 0 },
    validators: { onSubmit: incomeDraftSchema },
    onSubmit: ({ value }) => save.mutateAsync({ data: { ...value, budgetId, id: income?.id } }).catch(() => undefined),
  })

  return (
    <form
      className="grid gap-4 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppField name="label">
        {(field) => <field.TextField label="Libellé" placeholder="Salaire, CAF, pension…" maxLength={60} />}
      </form.AppField>
      <form.AppField name="amount">{(field) => <field.MoneyField label="Montant mensuel" />}</form.AppField>
      <div className="mt-2 flex gap-2">
        {income && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="text-destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate({ data: { budgetId, id: income.id } })}
            aria-label="Supprimer la ressource"
          >
            <Trash2 />
          </Button>
        )}
        <form.AppForm>
          <form.SubmitButton className="flex-1">Enregistrer</form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  )
}
