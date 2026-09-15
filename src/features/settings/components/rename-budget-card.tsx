import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { renameBudgetFn } from '@/features/budget/budget.functions'
import { labelSchema } from '@/features/budget/budget.schemas'
import { useInvalidateBudget } from '@/features/budget/use-invalidate-budget'

export function RenameBudgetCard({ budgetId, name }: { budgetId: string; name: string }) {
  const invalidate = useInvalidateBudget(budgetId)
  const rename = useMutation({
    mutationFn: renameBudgetFn,
    onSuccess: async () => {
      await invalidate()
      toast.success('Budget renommé')
    },
  })

  const form = useAppForm({
    defaultValues: { name },
    validators: { onSubmit: z.object({ name: labelSchema }) },
    onSubmit: ({ value }) => rename.mutateAsync({ data: { budgetId, name: value.name } }).catch(() => undefined),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nom du budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="name">{(field) => <field.TextField label="Nom" maxLength={60} />}</form.AppField>
          <form.AppForm>
            <form.SubmitButton>Renommer</form.SubmitButton>
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  )
}
