import { z } from 'zod'
import { budgetIdSchema } from '@/features/budget/budget.schemas'

export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024

/** Used by the file input; the server still checks the real content of the file. */
export const RECEIPT_ACCEPT = 'image/*,application/pdf,text/plain'

export const scanReceiptSchema = z.object({
  budgetId: budgetIdSchema,
  file: z
    .file('Aucun fichier reçu')
    .min(1, 'Le fichier est vide')
    .max(MAX_RECEIPT_BYTES, 'Fichier trop volumineux (10 Mo maximum)'),
})
