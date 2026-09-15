import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard'
import { ONBOARDING_STEPS } from '@/features/onboarding/onboarding.steps'

const onboardingSearchSchema = z.object({
  step: z.enum(ONBOARDING_STEPS).default('profile').catch('profile'),
})

export const Route = createFileRoute('/_app/onboarding')({
  validateSearch: onboardingSearchSchema,
  // The auth guard still runs on the server, but the wizard renders on the client only:
  // its draft lives in localStorage, which the server cannot read.
  ssr: 'data-only',
  head: () => ({ meta: [{ title: 'Créer mon budget — Budgeto' }] }),
  component: OnboardingPage,
})

function OnboardingPage() {
  const { step } = Route.useSearch()
  const { user } = Route.useRouteContext()

  return <OnboardingWizard step={step} defaultDisplayName={user.displayName} />
}
