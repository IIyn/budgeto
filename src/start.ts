import { createMiddleware, createStart } from '@tanstack/react-start'
import { MAX_RECEIPT_BYTES } from '@/features/expenses/receipt/receipt.schemas'

/** Receipt uploads plus multipart overhead; nothing else in the app sends large bodies. */
const MAX_BODY_BYTES = MAX_RECEIPT_BYTES + 2 * 1024 * 1024

/**
 * Rejects oversized uploads before their body is read, so a huge file cannot exhaust the Raspberry Pi's memory.
 * Browsers always send Content-Length for uploads; a file upload without it (chunked) could not be bounded, so it is refused.
 */
const bodySizeLimit = createMiddleware().server(({ request, next }) => {
  const contentLength = request.headers.get('content-length')

  if (contentLength === null && request.headers.get('content-type')?.includes('multipart/form-data')) {
    return new Response('Content-Length requis', { status: 411 })
  }
  if (Number(contentLength) > MAX_BODY_BYTES) {
    return new Response('Fichier trop volumineux (10 Mo maximum)', { status: 413 })
  }
  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [bodySizeLimit],
}))
