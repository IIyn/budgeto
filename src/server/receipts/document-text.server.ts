import { createCanvas, loadImage } from '@napi-rs/canvas'
import { extractText, getDocumentProxy, renderPageAsImage } from 'unpdf'
import { recognizeText } from './ocr.server'

/** Below this many characters a PDF is considered scanned (no text layer) and goes through OCR. */
const MIN_PDF_TEXT_LENGTH = 20
const MAX_SCANNED_PDF_PAGES = 2

/** Tesseract reads best when characters are ~30 px tall: small screenshots are enlarged, huge photos reduced. */
const MIN_IMAGE_SIDE = 1600
const MAX_IMAGE_SIDE = 3000
const MAX_UPSCALE = 3

type DocumentKind = 'pdf' | 'image' | 'text'

export class UnsupportedDocumentError extends Error {}

/** Returns the readable text of a receipt, whatever its format. */
export async function readDocumentText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())

  switch (detectKind(bytes, file.type)) {
    case 'pdf':
      return readPdf(bytes)
    case 'image':
      return recognizeText(await prepareImage(bytes))
    case 'text':
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    default:
      throw new UnsupportedDocumentError('Format non pris en charge : envoyez une image, un PDF ou un fichier texte')
  }
}

/** The declared MIME type comes from the client, so the actual content decides. */
function detectKind(bytes: Uint8Array, declaredType: string): DocumentKind | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end))
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte)

  if (ascii(0, 1024).includes('%PDF-')) return 'pdf'
  if (
    startsWith(0xff, 0xd8, 0xff) || // JPEG
    startsWith(0x89, 0x50, 0x4e, 0x47) || // PNG
    ascii(0, 4) === 'GIF8' ||
    ascii(0, 2) === 'BM' ||
    (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') ||
    (ascii(4, 8) === 'ftyp' && /^(avif|avis)$/.test(ascii(8, 12)))
  ) {
    return 'image'
  }
  if (ascii(4, 8) === 'ftyp' && /^(heic|heix|mif1|msf1)$/.test(ascii(8, 12))) {
    throw new UnsupportedDocumentError('Format HEIC non pris en charge : exportez la photo en JPEG')
  }
  if (declaredType.startsWith('text/') && isUtf8(bytes)) return 'text'
  return null
}

function isUtf8(bytes: Uint8Array) {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return true
  } catch {
    return false
  }
}

/** Decodes any supported image and resizes it to a size Tesseract handles well, on a white background. */
async function prepareImage(bytes: Uint8Array): Promise<Buffer> {
  const image = await loadImage(Buffer.from(bytes)).catch(() => {
    throw new UnsupportedDocumentError('Image illisible ou corrompue')
  })

  const longestSide = Math.max(image.width, image.height)
  const scale =
    longestSide < MIN_IMAGE_SIDE
      ? Math.min(MIN_IMAGE_SIDE / longestSide, MAX_UPSCALE)
      : Math.min(1, MAX_IMAGE_SIDE / longestSide)

  const canvas = createCanvas(Math.round(image.width * scale), Math.round(image.height * scale))
  const context = canvas.getContext('2d')
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toBuffer('image/png')
}

async function readPdf(bytes: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(bytes).catch(() => {
    throw new UnsupportedDocumentError('PDF illisible ou protégé par mot de passe')
  })

  const { text } = await extractText(pdf, { mergePages: true })
  if (text.replace(/\s/g, '').length >= MIN_PDF_TEXT_LENGTH) return text

  // Scanned PDF: render the first pages as images and read them.
  const pages: string[] = []
  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, MAX_SCANNED_PDF_PAGES); pageNumber++) {
    const png = await renderPageAsImage(pdf, pageNumber, { canvasImport: () => import('@napi-rs/canvas'), scale: 2 })
    pages.push(await recognizeText(Buffer.from(png)))
  }
  return pages.join('\n')
}
