const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: string, compact: boolean) {
  const key = `${currency}-${compact}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: compact ? 0 : 2,
      minimumFractionDigits: compact ? 0 : 2,
    })
    formatters.set(key, formatter)
  }
  return formatter
}

/** Formats an amount stored in cents: `formatMoney(123456)` → `1 234,56 €`. */
export function formatMoney(cents: number, options: { currency?: string; compact?: boolean } = {}) {
  const { currency = 'EUR', compact = false } = options
  return getFormatter(currency, compact).format(cents / 100)
}

export function toCents(euros: number) {
  return Math.round(euros * 100)
}

export function toEuros(cents: number) {
  return cents / 100
}

/** Parses user input such as `1 200,50` or `1200.5` into cents. Returns `null` when invalid. */
export function parseMoneyInput(input: string): number | null {
  const normalized = input.replace(/\s/g, '').replace(',', '.')
  if (normalized === '') return null
  if (!/^-?\d*\.?\d{0,2}$/.test(normalized)) return null
  const value = Number(normalized)
  return Number.isFinite(value) ? toCents(value) : null
}

export function percentOf(part: number, total: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 1000) / 10
}
