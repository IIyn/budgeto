import { KNOWN_MERCHANTS } from './receipt.merchants'

export type ReceiptGuess = {
  /** Merchant or document name, `null` when nothing convincing was found. */
  label: string | null
  /** Total in cents, `null` when no amount was found. */
  amount: number | null
}

const MAX_CENTS = 100_000_000

/** Lowercase, no accents: keyword matching must survive OCR and typographic variations. */
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

// ---------------------------------------------------------------------------
// Amount
// ---------------------------------------------------------------------------

/** Keywords announcing the amount actually paid, strongest first. */
const TOTAL_KEYWORDS: { pattern: RegExp; weight: number }[] = [
  { pattern: /\b(net|total|montant|reste) a payer\b/, weight: 100 },
  { pattern: /\b(total|montant) ttc\b/, weight: 95 },
  { pattern: /\b(amount due|total due|grand total|a payer)\b/, weight: 90 },
  { pattern: /\b(total|montant total)\b/, weight: 80 },
  { pattern: /\b(carte bancaire|paiement|cb|visa|mastercard|especes|debit)\b/, weight: 60 },
  { pattern: /\bmontant\b/, weight: 50 },
]

/** Lines whose amount is never the total paid. */
const EXCLUDED_LINE = /\b(sous[- ]?total|total ht|montant ht|hors taxes?|tva|taxes?|rendu|monnaie|remise|reduction|economies?|avoir|fidelite|points?|cagnotte|prix unitaire|p\.?u\.?|quantite|qte)\b/

/** `1 234,56` · `1.234,56` · `12,50` · `12.50` · `12€50`, optionally followed by a currency. */
const DECIMAL_AMOUNT = /(?<![\d,.])(\d{1,3}(?:[ .\u00a0]\d{3})+|\d+)\s?(?:[,.]|€)\s?(\d{2})(?!\d)/g
/** Whole amounts only count when a currency is written next to them: `45 €`, `EUR 45`. */
const WHOLE_AMOUNT = /(?:(?<![\d,.])(\d{1,6})\s?(?:€|eur\b|euros?\b))|(?:(?:€|eur)\s?(\d{1,6})(?![\d,.]))/g

/** Fixes frequent OCR confusions inside numbers (`1O,5O` → `10,50`). */
function repairDigits(line: string) {
  return line.replace(/(?<=\d[\d,.]*)[Oo]|[Oo](?=[\d,.]*\d)/g, '0').replace(/(?<=\d[,.]\d?)[lI]|(?<=\d)[lI](?=[,.]\d)/g, '1')
}

function findAmounts(line: string): number[] {
  const repaired = repairDigits(line)
  const amounts: number[] = []

  for (const match of repaired.matchAll(DECIMAL_AMOUNT)) {
    const units = Number((match[1] ?? '').replace(/[ .\u00a0]/g, ''))
    amounts.push(units * 100 + Number(match[2]))
  }
  if (amounts.length === 0) {
    for (const match of repaired.matchAll(WHOLE_AMOUNT)) {
      amounts.push(Number(match[1] ?? match[2]) * 100)
    }
  }
  return amounts.filter((cents) => cents > 0 && cents <= MAX_CENTS)
}

function hasCurrency(line: string) {
  return /€|\beur(os?)?\b/i.test(line)
}

export function findTotal(lines: string[]): number | null {
  let best: { weight: number; amount: number } | null = null

  for (const [index, line] of lines.entries()) {
    const normalized = normalize(line)
    if (EXCLUDED_LINE.test(normalized)) continue

    const weight = TOTAL_KEYWORDS.find((keyword) => keyword.pattern.test(normalized))?.weight
    if (!weight) continue

    // Some layouts print the amount on the line below its label.
    const next = lines[index + 1]
    const amounts = findAmounts(line)
    const candidates = amounts.length > 0 ? amounts : next && !EXCLUDED_LINE.test(normalize(next)) ? findAmounts(next) : []

    for (const amount of candidates) {
      // Same strength: the biggest wins (a receipt can list a total per VAT rate before the grand total).
      if (!best || weight > best.weight || (weight === best.weight && amount > best.amount)) {
        best = { weight, amount }
      }
    }
  }

  if (best) return best.amount

  const withCurrency = lines.filter(hasCurrency).flatMap(findAmounts)
  if (withCurrency.length > 0) return Math.max(...withCurrency)

  const any = lines.filter((line) => !EXCLUDED_LINE.test(normalize(line))).flatMap(findAmounts)
  return any.length > 0 ? Math.max(...any) : null
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

/** Header lines that are never the merchant name. */
const NOISE_LINE =
  /\b(rue|avenue|av|bd|boulevard|place|chemin|route|allee|impasse|quai|cedex|zi|za|zac|bp|tel|telephone|fax|siret|siren|rcs|ape|naf|tva|n°|no|www|http|ticket|facture|recu|devis|bon de commande|commande|bienvenue|merci|caisse|client|date|heure|page|carte|duplicata|magasin|vendeur|operateur|horaires?|ouvert)\b|@|\.(fr|com|net)\b/

const DATE_OR_TIME = /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b|\b\d{1,2}[:h]\d{2}\b/

function findKnownMerchant(text: string): string | null {
  const haystack = normalize(text)
  let found: { name: string; index: number } | null = null

  for (const name of KNOWN_MERCHANTS) {
    const escaped = normalize(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]?")
    const index = haystack.search(new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`))
    // Earliest mention wins; for the same position the longest name (Carrefour Market > Carrefour).
    if (index >= 0 && (!found || index < found.index || (index === found.index && name.length > found.name.length))) {
      found = { name, index }
    }
  }
  return found?.name ?? null
}

function toDisplayCase(line: string) {
  const letters = line.replace(/[^\p{L}]/gu, '')
  const isShouting = letters.length > 0 && letters === letters.toUpperCase()
  if (!isShouting) return line
  return line.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (_, separator: string, letter: string) => separator + letter.toUpperCase())
}

function looksLikeName(line: string) {
  const letters = line.match(/\p{L}/gu)?.length ?? 0
  const digits = line.match(/\d/g)?.length ?? 0
  const normalized = normalize(line)
  return (
    line.length >= 3 &&
    line.length <= 40 &&
    letters >= 3 &&
    letters / line.replace(/\s/g, '').length >= 0.7 &&
    digits <= 2 &&
    !NOISE_LINE.test(normalized) &&
    !DATE_OR_TIME.test(line) &&
    !TOTAL_KEYWORDS.some((keyword) => keyword.pattern.test(normalized))
  )
}

export function findLabel(lines: string[]): string | null {
  const known = findKnownMerchant(lines.join('\n'))
  if (known) return known

  // The merchant is almost always printed in the header of receipts and invoices.
  const header = lines.slice(0, 8).find(looksLikeName)
  if (!header) return null

  const cleaned = header.replace(/^[^\p{L}\d]+|[^\p{L}\d)]+$/gu, '').replace(/\s{2,}/g, ' ')
  return cleaned.length >= 3 ? toDisplayCase(cleaned).slice(0, 60) : null
}

// ---------------------------------------------------------------------------

export function parseReceipt(text: string): ReceiptGuess {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return { label: findLabel(lines), amount: findTotal(lines) }
}
