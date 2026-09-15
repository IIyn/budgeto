import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigate, useNavigate } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import { useEffect } from 'react'
import { onboardingStore } from '../onboarding.store'
import { completeOnboardingFn } from '../onboarding.functions'
import { firstIncompleteStep, ONBOARDING_STEPS, type OnboardingStep, validateStep } from '../onboarding.steps'
import { CategoriesStep } from './categories-step'
import { IncomesStep } from './incomes-step'
import { OnboardingShell } from './onboarding-shell'
import { ProfileStep } from './profile-step'
import { SplitStep } from './split-step'

type OnboardingWizardProps = {
  step: OnboardingStep
  defaultDisplayName: string
}

export function OnboardingWizard({ step, defaultDisplayName }: OnboardingWizardProps) {
  const navigate = useNavigate({ from: '/onboarding' })
  const draft = useSelector(onboardingStore)
  const complete = useCompleteOnboarding()

  useEffect(() => {
    if (!onboardingStore.state.displayName) onboardingStore.actions.update({ displayName: defaultDisplayName })
  }, [defaultDisplayName])

  // Deep links to a later step are sent back to the first step that still needs input.
  const incomplete = firstIncompleteStep(draft)
  if (incomplete && ONBOARDING_STEPS.indexOf(step) > ONBOARDING_STEPS.indexOf(incomplete)) {
    return <Navigate from="/onboarding" to="." search={{ step: incomplete }} replace />
  }

  const isLast = step === 'split'
  const next = ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1]

  const onContinue = () => {
    if (isLast) return complete.mutate(draft)
    if (next) void navigate({ search: { step: next } })
  }

  return (
    <OnboardingShell
      step={step}
      error={validateStep(step, draft)}
      submitting={complete.isPending}
      onContinue={onContinue}
      continueLabel={isLast ? 'Valider mon budget' : 'Continuer'}
    >
      {step === 'profile' && <ProfileStep />}
      {step === 'incomes' && <IncomesStep />}
      {step === 'fixed' && <CategoriesStep kind="fixed" />}
      {step === 'envelopes' && <CategoriesStep kind="flexible" />}
      {step === 'split' && <SplitStep />}
    </OnboardingShell>
  )
}

function useCompleteOnboarding() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: typeof onboardingStore.state) =>
      completeOnboardingFn({
        data: {
          displayName: draft.displayName.trim(),
          budgetName: draft.budgetName.trim(),
          incomes: draft.incomes
            .filter((income) => income.amount > 0)
            .map(({ label, amount }) => ({ label: label.trim(), amount })),
          categories: draft.categories
            .filter((category) => category.selected)
            .map(({ name, icon, kind, monthlyAmount }) => ({ name: name.trim(), icon, kind, monthlyAmount })),
        },
      }),
    onSuccess: async ({ budgetId }) => {
      await queryClient.invalidateQueries()
      await navigate({ to: '/budgets/$budgetId', params: { budgetId }, search: { welcome: true } })
      onboardingStore.actions.reset()
    },
  })
}
