import fra from '@tesseract.js-data/fra'
import { createWorker, OEM, PSM, type Worker } from 'tesseract.js'
import { rebuildRows } from '@/features/expenses/receipt/receipt.rows'

/** The OCR worker holds the French model in memory (~100 MB): it is released after a quiet period. */
const IDLE_TIMEOUT_MS = 5 * 60 * 1000

type OcrState = {
  worker: Promise<Worker> | null
  pendingJobs: number
  idleTimer: NodeJS.Timeout | undefined
}

// Survives Vite HMR reloads in development, like the database pool.
const globalForOcr = globalThis as unknown as { ocr?: OcrState }
const state: OcrState = (globalForOcr.ocr ??= { worker: null, pendingJobs: 0, idleTimer: undefined })

function getWorker() {
  state.worker ??= createWorker('fra', OEM.LSTM_ONLY, {
    // Bundled language data: works offline, nothing is downloaded at runtime.
    langPath: fra.langPath,
    gzip: true,
    cacheMethod: 'none',
  })
    .then(async (worker) => {
      // "Sparse text" finds every fragment: large bold headers as well as prices far right of their label.
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT })
      return worker
    })
    .catch((error: unknown) => {
      state.worker = null
      throw error
    })

  return state.worker
}

async function releaseWorker() {
  const worker = state.worker
  state.worker = null
  await (await worker)?.terminate()
}

/**
 * Extracts the text of an image (PNG/JPEG buffer), one printed row per line.
 * A single worker processes jobs one after another, which keeps the Raspberry Pi responsive.
 */
export async function recognizeText(image: Buffer): Promise<string> {
  clearTimeout(state.idleTimer)
  state.pendingJobs++

  try {
    const worker = await getWorker()
    const { data } = await worker.recognize(image, { rotateAuto: true }, { blocks: true })
    const words = (data.blocks ?? []).flatMap((block) =>
      block.paragraphs.flatMap((paragraph) => paragraph.lines.flatMap((line) => line.words)),
    )
    return rebuildRows(words)
  } finally {
    state.pendingJobs--
    if (state.pendingJobs === 0) {
      state.idleTimer = setTimeout(() => void releaseWorker(), IDLE_TIMEOUT_MS)
      state.idleTimer.unref()
    }
  }
}
