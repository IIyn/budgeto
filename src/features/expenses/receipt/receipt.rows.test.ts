import { describe, expect, it } from 'vitest'
import { type OcrWord, rebuildRows } from './receipt.rows'

const word = (text: string, x0: number, y0: number, height = 20): OcrWord => ({
  text,
  bbox: { x0, y0, x1: x0 + text.length * 10, y1: y0 + height },
})

describe('rebuildRows', () => {
  it('puts right-aligned prices back next to their label, even when read as a separate column', () => {
    const labels = [word('SOUS', 10, 100), word('TOTAL', 60, 100), word('TOTAL', 10, 140), word('A', 70, 141), word('PAYER', 90, 140)]
    const prices = [word('18,39', 400, 102), word('16,89', 400, 139)]

    expect(rebuildRows([...prices, ...labels])).toBe('SOUS TOTAL 18,39\nTOTAL A PAYER 16,89')
  })

  it('tolerates a slightly tilted photo and keeps big headers on their own row', () => {
    const words = [word('MONOPRIX', 50, 10, 60), word('BANANES', 10, 100), word('2,49', 400, 108), word('PAIN', 10, 140), word('2,10', 400, 147)]

    expect(rebuildRows(words)).toBe('MONOPRIX\nBANANES 2,49\nPAIN 2,10')
  })

  it('ignores empty words', () => {
    expect(rebuildRows([word(' ', 0, 0), word('Merci', 0, 50)])).toBe('Merci')
  })
})
