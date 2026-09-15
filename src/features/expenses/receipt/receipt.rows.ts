export type OcrWord = {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

type Row = { centerY: number; height: number; words: OcrWord[] }

/**
 * Rebuilds the printed rows of a receipt from positioned words.
 * OCR engines often read labels and right-aligned prices as separate columns;
 * grouping words by vertical position puts "TOTAL A PAYER" and "16,89" back on the same line.
 */
export function rebuildRows(words: OcrWord[]): string {
  const centerY = (word: OcrWord) => (word.bbox.y0 + word.bbox.y1) / 2
  const rows: Row[] = []

  for (const word of [...words].filter((w) => w.text.trim()).sort((a, b) => centerY(a) - centerY(b))) {
    const height = word.bbox.y1 - word.bbox.y0
    const row = rows.find((candidate) => Math.abs(candidate.centerY - centerY(word)) < Math.max(height, candidate.height) / 2)

    if (row) {
      row.words.push(word)
      row.centerY += (centerY(word) - row.centerY) / row.words.length
      row.height = Math.max(row.height, height)
    } else {
      rows.push({ centerY: centerY(word), height, words: [word] })
    }
  }

  return rows
    .sort((a, b) => a.centerY - b.centerY)
    .map((row) => row.words.sort((a, b) => a.bbox.x0 - b.bbox.x0).map((word) => word.text).join(' '))
    .join('\n')
}
