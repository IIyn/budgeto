import { Camera, ClipboardPaste, Paperclip, ScanText } from 'lucide-react'
import { type DragEvent, useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReceiptScanResult } from '../receipt/receipt.functions'
import { RECEIPT_ACCEPT } from '../receipt/receipt.schemas'
import { useReceiptScan } from '../receipt/use-receipt-scan'
import { ReceiptScanStatus } from './receipt-scan-status'

/** Icon above the label: three sources fit side by side on a narrow phone. */
const SOURCE_BUTTON = 'h-auto flex-col gap-1 px-2 py-2.5 text-xs'

type ReceiptScannerProps = {
  budgetId: string
  onResult: (result: ReceiptScanResult) => void
}

/** Take a photo, pick a file, paste or drop a receipt: its name and total pre-fill the expense form. */
export function ReceiptScanner({ budgetId, onResult }: ReceiptScannerProps) {
  const { state, scan, reset } = useReceiptScan({ budgetId, onResult })
  const [dragging, setDragging] = useState(false)
  const cameraInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const canReadClipboard = typeof navigator !== 'undefined' && typeof navigator.clipboard?.read === 'function'

  usePastedFile(scan)

  const onFileChosen = (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = ''
    if (file) void scan(file)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void scan(file)
  }

  const pasteFromClipboard = async () => {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith('image/') || t === 'application/pdf')
        if (type) {
          const blob = await item.getType(type)
          return void scan(new File([blob], 'Image collée', { type }))
        }
      }
      toast.info('Le presse-papiers ne contient pas d’image')
    } catch {
      toast.info('Accès au presse-papiers refusé : utilisez Ctrl+V ou « Coller »')
    }
  }

  return (
    <section
      aria-label="Scanner un justificatif"
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'grid grid-cols-[minmax(0,1fr)] gap-3 rounded-2xl border border-dashed p-3 transition-colors',
        dragging ? 'border-primary bg-primary/5' : 'bg-muted/40',
      )}
    >
      {state.status === 'idle' ? (
        <div className="flex items-center gap-3">
          <span className="bg-primary/12 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <ScanText className="size-5" />
          </span>
          <div className="min-w-0 text-sm">
            <p className="font-medium">Scanner un ticket ou une facture</p>
            <p className="text-muted-foreground text-xs">Le nom et le montant sont lus pour vous, à vérifier avant d'ajouter.</p>
          </div>
        </div>
      ) : (
        <ReceiptScanStatus state={state} onClear={reset} />
      )}

      <div className={cn('grid gap-2', canReadClipboard ? 'grid-cols-3' : 'grid-cols-2')}>
        <Button type="button" variant="outline" className={SOURCE_BUTTON} onClick={() => cameraInput.current?.click()}>
          <Camera />
          Photo
        </Button>
        <Button type="button" variant="outline" className={SOURCE_BUTTON} onClick={() => fileInput.current?.click()}>
          <Paperclip />
          Fichier
        </Button>
        {canReadClipboard && (
          <Button type="button" variant="outline" className={SOURCE_BUTTON} onClick={pasteFromClipboard}>
            <ClipboardPaste />
            Coller
          </Button>
        )}
      </div>

      {/* `capture` opens the camera directly on phones; desktop browsers fall back to a file picker. */}
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => onFileChosen(event.currentTarget)}
      />
      <input
        ref={fileInput}
        type="file"
        accept={RECEIPT_ACCEPT}
        className="hidden"
        onChange={(event) => onFileChosen(event.currentTarget)}
      />
    </section>
  )
}

/** Ctrl+V / "Coller" anywhere in the open drawer scans a pasted image; pasting text into fields is unaffected. */
function usePastedFile(onFile: (file: File) => void) {
  const handleFile = useEffectEvent(onFile)

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = event.clipboardData?.files[0]
      if (!file) return
      event.preventDefault()
      handleFile(file)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [])
}
