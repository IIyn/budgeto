import { useSelector } from '@tanstack/react-store'
import { TriangleAlert, WandSparkles } from 'lucide-react'
import { useEffect } from 'react'
import { MoneyInput } from '@/components/form/money-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { AllocationChart } from '@/features/budget/components/allocation-chart'
import { CategoryIcon } from '@/features/budget/components/category-icon'
import { formatMoney, percentOf } from '@/lib/money'
import { type DraftCategory, draftTotals, onboardingStore } from '../onboarding.store'

export function SplitStep() {
  const draft = useSelector(onboardingStore)
  const { proposeSplit, updateCategory } = onboardingStore.actions
  const totals = draftTotals(draft)
  const envelopes = draft.categories.filter((c) => c.kind === 'flexible' && c.selected)

  useEffect(() => {
    if (!onboardingStore.state.splitProposed) proposeSplit()
  }, [proposeSplit])

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Total label="Ressources" value={totals.income} />
        <Total label="Charges fixes" value={-totals.fixed} />
        <Total label="Reste" value={totals.afterFixed} highlight />
      </div>

      <Card>
        <CardContent>
          <AllocationChart
            income={totals.income}
            fixed={totals.fixed}
            envelopes={envelopes.map((e) => ({ key: e.id, label: e.name, amount: e.monthlyAmount }))}
          />
        </CardContent>
      </Card>

      {totals.unallocated < 0 && (
        <p className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl p-3 text-sm">
          <TriangleAlert className="size-4 shrink-0" />
          Vous dépassez vos ressources de {formatMoney(-totals.unallocated)}.
        </p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Enveloppes</h2>
        <Button variant="ghost" size="sm" onClick={proposeSplit}>
          <WandSparkles />
          Proposer
        </Button>
      </div>

      {envelopes.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Aucune enveloppe choisie : tout le reste sera libre. Vous pourrez en ajouter plus tard.
        </p>
      )}

      {envelopes.map((envelope) => (
        <EnvelopeSlider
          key={envelope.id}
          envelope={envelope}
          income={totals.income}
          max={Math.max(totals.afterFixed, envelope.monthlyAmount)}
          onChange={(monthlyAmount) => updateCategory(envelope.id, { monthlyAmount })}
        />
      ))}
    </div>
  )
}

function Total({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={highlight ? 'bg-primary text-primary-foreground rounded-2xl p-3' : 'bg-muted rounded-2xl p-3'}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-bold tabular-nums">{formatMoney(value, { compact: true })}</p>
    </div>
  )
}

type EnvelopeSliderProps = {
  envelope: DraftCategory
  income: number
  max: number
  onChange: (cents: number) => void
}

function EnvelopeSlider({ envelope, income, max, onChange }: EnvelopeSliderProps) {
  return (
    <div className="bg-card grid gap-3 rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <CategoryIcon icon={envelope.icon} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{envelope.name}</p>
          <p className="text-muted-foreground text-xs">{percentOf(envelope.monthlyAmount, income)} % des ressources</p>
        </div>
        <MoneyInput value={envelope.monthlyAmount} onValueChange={onChange} className="w-28" aria-label={envelope.name} />
      </div>
      <Slider
        value={[envelope.monthlyAmount]}
        max={Math.max(max, 500)}
        step={500}
        onValueChange={([value]) => onChange(value ?? 0)}
        aria-label={`Répartition pour ${envelope.name}`}
      />
    </div>
  )
}
