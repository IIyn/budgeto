const MAX_UPLOAD_SIDE = 2400
const KEEP_ORIGINAL_BELOW_BYTES = 1.5 * 1024 * 1024

/**
 * Phone photos (often 12 MP / 5 MB) are reduced in the browser before upload:
 * faster over mobile data and on the Raspberry Pi, with no loss for OCR.
 * Re-encoding as JPEG also converts formats the server can't decode (HEIC photos on iPhone).
 */
export async function prepareReceiptFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  try {
    const scale = Math.min(1, MAX_UPLOAD_SIDE / Math.max(bitmap.width, bitmap.height))
    const isCommonFormat = file.type === 'image/jpeg' || file.type === 'image/png'
    if (scale === 1 && isCommonFormat && file.size < KEEP_ORIGINAL_BELOW_BYTES) return file

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    if (!context) return file
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  } finally {
    bitmap.close()
  }
}
