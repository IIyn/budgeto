import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { requireBudgetRole } from '@/server/budget/access.server'
import { readDocumentText, UnsupportedDocumentError } from '@/server/receipts/document-text.server'
import { authMiddleware } from '../../auth/auth.middleware'
import { parseReceipt } from './receipt.parse'
import { scanReceiptSchema } from './receipt.schemas'

/**
 * Reads a receipt (photo, image, PDF or text) on the server and guesses the expense name and total.
 * The file is only held in memory for the duration of the request: nothing is stored.
 */
export const scanReceiptFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error('Formulaire invalide')
    const parsed = scanReceiptSchema.safeParse({ budgetId: data.get('budgetId'), file: data.get('file') })
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Fichier invalide')
    return parsed.data
  })
  .handler(async ({ data, context }) => {
    await requireBudgetRole(context.user.id, data.budgetId, 'editor')

    try {
      const text = await readDocumentText(data.file)
      return { ...parseReceipt(text), hasText: text.trim().length > 0 }
    } catch (error) {
      if (error instanceof UnsupportedDocumentError) {
        setResponseStatus(415)
        throw new Error(error.message)
      }
      throw error
    }
  })

export type ReceiptScanResult = Awaited<ReturnType<typeof scanReceiptFn>>
