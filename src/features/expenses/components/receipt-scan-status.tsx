import { CircleAlert, CircleCheck, FileText, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'
import type { ReceiptScanState } from '../receipt/use-receipt-scan'

type ReceiptScanStatusProps = {
  state: Exclude<ReceiptScanState, { status: 'idle' }>
  onClear: () => void
}

export function ReceiptScanStatus({ state, onClear }: ReceiptScanStatusProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3" aria-live="polite">
      <div className="flex items-center gap-3">
        <Thumbnail previewUrl={state.previewUrl} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />

        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate font-medium">{state.name}</p>
          {state.status === 'reading' && (
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" />
              Lecture du document…
            </p>
          )}
          {state.status === 'error' && <p className="text-destructive">{state.message}</p>}
          {state.status === 'done' && !state.result.hasText && (
            <p className="text-muted-foreground">Aucun texte lisible. Essayez une photo plus nette ou remplissez à la main.</p>
          )}
          {state.status === 'done' && state.result.hasText && (
            <ul className="mt-0.5 flex min-w-0 flex-col gap-0.5">
              <Finding found={state.result.label !== null} label={state.result.label ?? 'Nom non trouvé : saisissez-le'} />
              <Finding
                found={state.result.amount !== null}
                label={state.result.amount !== null ? formatMoney(state.result.amount) : 'Montant non trouvé : saisissez-le'}
              />
            </ul>
          )}
        </div>

        <Button type="button" variant="ghost" size="icon" onClick={onClear} aria-label="Retirer le document">
          <X />
        </Button>
      </div>

      {expanded && state.previewUrl && (
        <img src={state.previewUrl} alt="Aperçu du justificatif" className="max-h-[50dvh] w-full rounded-xl border object-contain" />
      )}
    </div>
  )
}

function Thumbnail({ previewUrl, expanded, onToggle }: { previewUrl?: string; expanded: boolean; onToggle: () => void }) {
  if (!previewUrl) {
    return (
      <span className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-lg">
        <FileText className="size-6" />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={expanded ? "Masquer l'aperçu" : "Agrandir l'aperçu"}
      className="size-14 shrink-0 overflow-hidden rounded-lg border"
    >
      <img src={previewUrl} alt="" className="size-full object-cover" />
    </button>
  )
}

function Finding({ found, label }: { found: boolean; label: string }) {
  const Icon = found ? CircleCheck : CircleAlert
  return (
    <li className={cn('flex min-w-0 items-center gap-1.5', found ? 'text-foreground' : 'text-warning')}>
      <Icon className={cn('size-3.5 shrink-0', found && 'text-success')} />
      <span className="truncate">{label}</span>
    </li>
  )
}
