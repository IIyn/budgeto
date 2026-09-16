import { useMutation, useQuery } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '@/components/form/form'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { type Expense, budgetQueries } from '@/features/budget/budget.queries'
import { type OperationKind, categoryIconSchema, saveExpenseSchema } from '@/features/budget/budget.schemas'
import { useInvalidateBudget } from '@/features/budget/use-invalidate-budget'
import { today } from '@/lib/month'
import { deleteExpenseFn, saveExpenseFn } from '../expenses.functions'
import { CategoryChips } from './category-chips'
import { ExpenseIconField } from './expense-icon-field'
import { OperationKindSwitch } from './operation-kind-switch'
import { ReceiptScanner } from './receipt-scanner'

const KIND_LABELS: Record<OperationKind, string> = {
  expense: 'Dépense',
  income: "Entrée d'argent",
}

function focusField(name: 'amount' | 'label') {
  requestAnimationFrame(() => document.getElementById(name)?.focus())
}

type ExpenseDrawerProps = {
  budgetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the drawer edits this operation instead of creating one. */
  expense?: Expense
}

export function ExpenseDrawer({ budgetId, open, onOpenChange, expense }: ExpenseDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh]">
        <DrawerHeader>
          <DrawerTitle>{expense ? "Modifier l'opération" : 'Nouvelle opération'}</DrawerTitle>
          <DrawerDescription>Une dépense est déduite de ce qu'il reste ce mois-ci, une entrée d'argent s'y ajoute.</DrawerDescription>
        </DrawerHeader>
        {open && <ExpenseForm budgetId={budgetId} expense={expense} onDone={() => onOpenChange(false)} />}
      </DrawerContent>
    </Drawer>
  )
}

const expenseFormSchema = saveExpenseSchema.omit({ budgetId: true, id: true }).extend({
  label: z.string().trim().max(60, '60 caractères maximum'),
})

type ExpenseFormProps = {
  budgetId: string
  expense?: Expense
  onDone: () => void
}

function ExpenseForm({ budgetId, expense, onDone }: ExpenseFormProps) {
  const { data: categories = [] } = useQuery(budgetQueries.categories(budgetId))
  const invalidate = useInvalidateBudget(budgetId)

  const save = useMutation({
    mutationFn: saveExpenseFn,
    onSuccess: async (_, { data }) => {
      await invalidate()
      toast.success(`${KIND_LABELS[data.kind]} ${expense ? 'modifiée' : 'ajoutée'}`)
      onDone()
    },
  })

  const remove = useMutation({
    mutationFn: deleteExpenseFn,
    onSuccess: async () => {
      await invalidate()
      toast.success(`${KIND_LABELS[expense?.kind ?? 'expense']} supprimée`)
      onDone()
    },
  })

  const form = useAppForm({
    defaultValues: {
      kind: expense?.kind ?? ('expense' as OperationKind),
      amount: expense?.amount ?? 0,
      label: expense?.label ?? '',
      categoryId: expense?.categoryId ?? (null as string | null),
      icon: categoryIconSchema.nullable().catch(null).parse(expense?.icon ?? null),
      spentOn: expense?.spentOn ?? today(),
    },
    validators: { onSubmit: expenseFormSchema },
    onSubmit: ({ value }) => {
      const isIncome = value.kind === 'income'
      const categoryId = isIncome ? null : value.categoryId
      const categoryName = categories.find((c) => c.id === categoryId)?.name
      const label = value.label.trim() || categoryName || KIND_LABELS[value.kind]
      return save
        .mutateAsync({ data: { ...value, categoryId, label, budgetId, id: expense?.id } })
        .catch(() => undefined)
    },
  })

  return (
    <form
      className="grid grid-cols-[minmax(0,1fr)] gap-5 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="kind">
        {(field) => <OperationKindSwitch value={field.state.value} onChange={field.handleChange} />}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.kind}>
        {(kind) =>
          !expense &&
          kind === 'expense' && (
            <ReceiptScanner
              budgetId={budgetId}
              onResult={(result) => {
                if (result.amount !== null) form.setFieldValue('amount', result.amount)
                if (result.label) form.setFieldValue('label', result.label)
                // Bring the user straight to what still has to be typed by hand.
                if (result.amount === null) focusField('amount')
                else if (!result.label) focusField('label')
              }}
            />
          )
        }
      </form.Subscribe>

      <form.AppField name="amount">{(field) => <field.MoneyField label="Montant" />}</form.AppField>

      <form.Subscribe selector={(state) => state.values.kind}>
        {(kind) =>
          kind === 'expense' && (
            <form.Field name="categoryId">
              {(field) => (
                <div className="grid gap-2">
                  <Label>Catégorie</Label>
                  <CategoryChips categories={categories} value={field.state.value} onChange={field.handleChange} />
                </div>
              )}
            </form.Field>
          )
        }
      </form.Subscribe>

      <form.Subscribe selector={(state) => [state.values.kind, state.values.categoryId] as const}>
        {([kind, categoryId]) => (
          <form.Field name="icon">
            {(field) => (
              <ExpenseIconField
                value={field.state.value}
                kind={kind}
                categoryIcon={categories.find((c) => c.id === categoryId)?.icon}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        )}
      </form.Subscribe>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <form.AppField name="label">
          {(field) => <field.TextField label="Libellé" placeholder="Optionnel" maxLength={60} />}
        </form.AppField>
        <form.AppField name="spentOn">{(field) => <field.TextField label="Date" type="date" />}</form.AppField>
      </div>

      <div className="flex gap-2">
        {expense && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="text-destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate({ data: { budgetId, id: expense.id } })}
            aria-label="Supprimer l'opération"
          >
            <Trash2 />
          </Button>
        )}
        <form.AppForm>
          <form.Subscribe selector={(state) => state.values.kind}>
            {(kind) => (
              <form.SubmitButton className="flex-1">
                {expense ? 'Enregistrer' : kind === 'income' ? "Ajouter l'entrée d'argent" : 'Ajouter la dépense'}
              </form.SubmitButton>
            )}
          </form.Subscribe>
        </form.AppForm>
      </div>
    </form>
  )
}
