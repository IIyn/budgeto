import { z } from 'zod'

/** A month identifier such as `2026-09`. */
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mois invalide')

export type Month = z.infer<typeof monthSchema>

export function currentMonth(date = new Date()): Month {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(month: Month, delta: number): Month {
  const [year, monthIndex] = month.split('-').map(Number) as [number, number]
  return currentMonth(new Date(year, monthIndex - 1 + delta, 1))
}

/** First and last day of the month, as `YYYY-MM-DD` strings for SQL date comparisons. */
export function monthRange(month: Month) {
  const [year, monthIndex] = month.split('-').map(Number) as [number, number]
  const lastDay = new Date(year, monthIndex, 0).getDate()
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` }
}

export function formatMonth(month: Month) {
  const [year, monthIndex] = month.split('-').map(Number) as [number, number]
  const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthIndex - 1, 1),
  )
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function today() {
  const date = new Date()
  return `${currentMonth(date)}-${String(date.getDate()).padStart(2, '0')}`
}

export function formatDay(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number) as [number, number, number]
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(year, month - 1, day),
  )
}
