import { useSelector } from '@tanstack/react-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { onboardingStore } from '../onboarding.store'

export function ProfileStep() {
  const displayName = useSelector(onboardingStore, (draft) => draft.displayName)
  const budgetName = useSelector(onboardingStore, (draft) => draft.budgetName)
  const { update } = onboardingStore.actions

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="displayName">Votre nom ou pseudo</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => update({ displayName: event.target.value })}
          placeholder="Camille"
          autoComplete="nickname"
          maxLength={60}
          autoFocus
          className="h-12 text-lg"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="budgetName">Nom du budget</Label>
        <Input
          id="budgetName"
          value={budgetName}
          onChange={(event) => update({ budgetName: event.target.value })}
          placeholder="Budget de la maison"
          maxLength={60}
          className="h-12 text-lg"
        />
        <p className="text-muted-foreground text-sm">Vous pourrez le partager avec vos proches ensuite.</p>
      </div>
    </div>
  )
}
