import { useSelector } from '@tanstack/react-store'
import { Plus, X } from 'lucide-react'
import { MoneyInput } from '@/components/form/money-input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatMoney } from '@/lib/money'
import { onboardingStore } from '../onboarding.store'

export function IncomesStep() {
  const incomes = useSelector(onboardingStore, (draft) => draft.incomes)
  const { addIncome, updateIncome, removeIncome } = onboardingStore.actions
  const total = incomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="grid gap-4">
      <div className="from-chart-2/20 to-chart-5/10 rounded-2xl bg-linear-to-br p-5">
        <p className="text-muted-foreground text-sm">Total mensuel</p>
        <p className="text-3xl font-bold tabular-nums">{formatMoney(total)}</p>
      </div>

      {incomes.map((income, index) => (
        <Card key={income.id} className="gap-3 p-4">
          <div className="flex items-center gap-2">
            <Input
              value={income.label}
              onChange={(event) => updateIncome(income.id, { label: event.target.value })}
              placeholder="Salaire, CAF, pension…"
              aria-label="Libellé de la ressource"
              maxLength={60}
              className="h-11"
            />
            {incomes.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeIncome(income.id)} aria-label="Retirer">
                <X />
              </Button>
            )}
          </div>
          <MoneyInput
            value={income.amount}
            onValueChange={(amount) => updateIncome(income.id, { amount })}
            aria-label="Montant mensuel"
            autoFocus={index === 0 && income.amount === 0}
            className="text-lg"
          />
        </Card>
      ))}

      <Button variant="outline" size="lg" onClick={addIncome}>
        <Plus />
        Ajouter une autre ressource
      </Button>
    </div>
  )
}
