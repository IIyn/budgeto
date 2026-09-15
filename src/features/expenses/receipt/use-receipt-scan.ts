import { useEffect, useRef, useState } from 'react'
import { type ReceiptScanResult, scanReceiptFn } from './receipt.functions'
import { MAX_RECEIPT_BYTES } from './receipt.schemas'
import { prepareReceiptFile } from './prepare-receipt-file'

type ScannedFile = {
  name: string
  /** Local object URL, only for images: the preview never leaves the browser. */
  previewUrl?: string
}

export type ReceiptScanState =
  | { status: 'idle' }
  | ({ status: 'reading' } & ScannedFile)
  | ({ status: 'done'; result: ReceiptScanResult } & ScannedFile)
  | ({ status: 'error'; message: string } & ScannedFile)

type UseReceiptScanOptions = {
  budgetId: string
  onResult: (result: ReceiptScanResult) => void
}

export function useReceiptScan({ budgetId, onResult }: UseReceiptScanOptions) {
  const [state, setState] = useState<ReceiptScanState>({ status: 'idle' })
  const latestRequest = useRef(0)
  const previewUrl = state.status === 'idle' ? undefined : state.previewUrl

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const scan = async (file: File) => {
    const request = ++latestRequest.current
    const scanned: ScannedFile = {
      name: file.name || 'Image collée',
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }
    setState({ status: 'reading', ...scanned })

    try {
      const prepared = await prepareReceiptFile(file)
      if (prepared.size > MAX_RECEIPT_BYTES) throw new Error('Fichier trop volumineux (10 Mo maximum)')

      const formData = new FormData()
      formData.set('budgetId', budgetId)
      formData.set('file', prepared)
      const result = await scanReceiptFn({ data: formData })

      // A newer file was chosen while this one was being read.
      if (request !== latestRequest.current) return
      setState({ status: 'done', result, ...scanned })
      onResult(result)
    } catch (error) {
      if (request !== latestRequest.current) return
      const message = error instanceof Error ? error.message : 'Lecture impossible'
      setState({ status: 'error', message, ...scanned })
    }
  }

  const reset = () => {
    latestRequest.current++
    setState({ status: 'idle' })
  }

  return { state, scan, reset }
}
