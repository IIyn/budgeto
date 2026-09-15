import { useMutation } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppForm } from '@/components/form/form'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { CategoryIconName } from '@/features/budget/budget.constants'
import type { Category } from '@/features/budget/budget.queries'
import { type CategoryKind, categoryDraftSchema, categoryIconSchema } from '@/features/budget/budget.schemas'
import { useInvalidateBudget } from '@/features/budget/use-invalidate-budget'
import { deleteCategoryFn, saveCategoryFn } from '../settings.functions'
import { IconPicker } from '@/features/budget/components/icon-picker'

type CategoryDrawerProps = {
  budgetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  defaultKind: CategoryKind
}

export function CategoryDrawer({ budgetId, open, onOpenChange, category, defaultKind }: CategoryDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh]">
        <DrawerHeader>
          <DrawerTitle>{category ? 'Modifier' : 'Nouvelle ligne de budget'}</DrawerTitle>
          <DrawerDescription>
            Une charge fixe est déduite chaque mois, une enveloppe se consomme au fil des dépenses.
          </DrawerDescription>
        </DrawerHeader>
        {open && (
          <CategoryForm
            budgetId={budgetId}
            category={category}
            defaultKind={defaultKind}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

type CategoryFormProps = Omit<CategoryDrawerProps, 'open' | 'onOpenChange'> & { onDone: () => void }

function CategoryForm({ budgetId, category, defaultKind, onDone }: CategoryFormProps) {
  const invalidate = useInvalidateBudget(budgetId)
  const onSuccess = async (message: string) => {
    await invalidate()
    toast.success(message)
    onDone()
  }

  const save = useMutation({
    mutationFn: saveCategoryFn,
    onSuccess: () => onSuccess(category ? 'Modifications enregistrées' : 'Ligne ajoutée'),
  })
  const remove = useMutation({
    mutationFn: deleteCategoryFn,
    onSuccess: () => onSuccess('Ligne supprimée'),
  })

  const form = useAppForm({
    defaultValues: {
      name: category?.name ?? '',
      icon: categoryIconSchema.catch('circle').parse(category?.icon) as CategoryIconName,
      kind: category?.kind ?? defaultKind,
      monthlyAmount: category?.monthlyAmount ?? 0,
    },
    validators: { onSubmit: categoryDraftSchema },
    onSubmit: ({ value }) =>
      save.mutateAsync({ data: { ...value, budgetId, id: category?.id } }).catch(() => undefined),
  })

  return (
    <form
      className="grid gap-4 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="kind">
        {(field) => (
          <ToggleGroup
            type="single"
            variant="outline"
            value={field.state.value}
            onValueChange={(value) => value && field.handleChange(value as CategoryKind)}
            className="w-full"
          >
            <ToggleGroupItem value="fixed" className="h-11 flex-1">
              Charge fixe
            </ToggleGroupItem>
            <ToggleGroupItem value="flexible" className="h-11 flex-1">
              Enveloppe
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </form.Field>

      <form.AppField name="name">
        {(field) => <field.TextField label="Nom" placeholder="Loyer, Courses…" maxLength={60} />}
      </form.AppField>

      <form.Subscribe selector={(state) => state.values.kind}>
        {(kind) => (
          <form.AppField name="monthlyAmount">
            {(field) => <field.MoneyField label={kind === 'fixed' ? 'Montant mensuel' : 'Budget mensuel'} />}
          </form.AppField>
        )}
      </form.Subscribe>

      <form.Field name="icon">
        {(field) => (
          <div className="grid gap-2">
            <Label>Icône</Label>
            <IconPicker value={field.state.value} onChange={field.handleChange} />
          </div>
        )}
      </form.Field>

      <div className="mt-2 flex gap-2">
        {category && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="text-destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate({ data: { budgetId, id: category.id } })}
            aria-label="Supprimer"
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
