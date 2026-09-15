import { labelSchema } from '../budget/budget.schemas'
import type { OnboardingDraft } from './onboarding.store'

export const ONBOARDING_STEPS = ['profile', 'incomes', 'fixed', 'envelopes', 'split'] as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

export const STEP_TITLES: Record<OnboardingStep, { title: string; description: string }> = {
  profile: { title: 'Faisons connaissance', description: 'Comment doit-on vous appeler ?' },
  incomes: { title: 'Vos ressources', description: "Combien d'argent arrive chaque mois ?" },
  fixed: { title: 'Vos charges fixes', description: 'Ce qui part chaque mois, quoi qu’il arrive.' },
  envelopes: { title: 'Vos dépenses du quotidien', description: 'Choisissez les postes que vous voulez suivre.' },
  split: { title: 'Votre répartition', description: 'Ajustez librement la proposition.' },
}

/** Returns an error message when the step is not complete yet, `null` when the user can continue. */
export function validateStep(step: OnboardingStep, draft: OnboardingDraft): string | null {
  switch (step) {
    case 'profile':
      if (!labelSchema.safeParse(draft.displayName).success) return 'Indiquez votre nom ou pseudo'
      if (!labelSchema.safeParse(draft.budgetName).success) return 'Donnez un nom à votre budget'
      return null
    case 'incomes':
      if (draft.incomes.some((i) => i.amount > 0 && !i.label.trim())) return 'Chaque ressource a besoin d’un libellé'
      if (!draft.incomes.some((i) => i.amount > 0)) return 'Indiquez au moins une ressource mensuelle'
      return null
    case 'fixed':
    case 'envelopes':
      if (draft.categories.some((c) => c.selected && !c.name.trim())) return 'Chaque poste a besoin d’un nom'
      return null
    case 'split':
      return null
  }
}

export function firstIncompleteStep(draft: OnboardingDraft): OnboardingStep | undefined {
  return ONBOARDING_STEPS.find((step) => validateStep(step, draft) !== null)
}
