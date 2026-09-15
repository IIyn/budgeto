import { Link } from '@tanstack/react-router'
import { ChevronLeft, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ONBOARDING_STEPS, type OnboardingStep, STEP_TITLES } from '../onboarding.steps'

type OnboardingShellProps = {
  step: OnboardingStep
  error: string | null
  submitting?: boolean
  onContinue: () => void
  continueLabel?: string
  children: ReactNode
}

export function OnboardingShell({
  step,
  error,
  submitting = false,
  onContinue,
  continueLabel = 'Continuer',
  children,
}: OnboardingShellProps) {
  const index = ONBOARDING_STEPS.indexOf(step)
  const previous = ONBOARDING_STEPS[index - 1]
  const { title, description } = STEP_TITLES[step]

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3 py-2">
        {previous ? (
          <Button variant="ghost" size="icon-lg" className="-ml-2" asChild>
            <Link from="/onboarding" to="." search={{ step: previous }} aria-label="Étape précédente">
              <ChevronLeft />
            </Link>
          </Button>
        ) : (
          <img src="/favicon.svg" alt="" className="size-8" />
        )}
        <div className="flex flex-1 gap-1.5" aria-label={`Étape ${index + 1} sur ${ONBOARDING_STEPS.length}`}>
          {ONBOARDING_STEPS.map((s, i) => (
            <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </header>

      <div className="py-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="flex-1 pb-6">{children}</div>

      <footer className="bg-background/90 sticky bottom-0 -mx-4 border-t px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        {error && <p className="text-muted-foreground mb-2 text-center text-sm">{error}</p>}
        <Button size="lg" className="h-12 w-full text-base" disabled={error !== null || submitting} onClick={onContinue}>
          {submitting && <Loader2 className="animate-spin" />}
          {continueLabel}
        </Button>
      </footer>
    </div>
  )
}
