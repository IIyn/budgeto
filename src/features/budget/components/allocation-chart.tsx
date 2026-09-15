import { ClientOnly } from '@tanstack/react-router'
import { Cell, Label, Pie, PieChart } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney, percentOf } from '@/lib/money'

export type AllocationSlice = { key: string; label: string; amount: number }

type AllocationChartProps = {
  income: number
  fixed: number
  envelopes: AllocationSlice[]
}

const PALETTE = [2, 3, 4, 6, 7, 8, 1].map((n) => `var(--chart-${n})`)

/** Donut of how the monthly income is split: fixed charges, envelopes, and what is left free. */
export function AllocationChart({ income, fixed, envelopes }: AllocationChartProps) {
  const slices = buildSlices({ income, fixed, envelopes })
  const free = slices.find((slice) => slice.key === 'free')?.amount ?? 0
  const config = Object.fromEntries(slices.map((s) => [s.key, { label: s.label, color: s.color }])) satisfies ChartConfig

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
      <ClientOnly fallback={<Skeleton className="mx-auto aspect-square w-full max-w-[220px] rounded-full" />}>
        <ChartContainer config={config} className="mx-auto aspect-square w-full max-w-[220px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="key"
                  formatter={(value, _name, item) => (
                    <span className="flex w-full justify-between gap-3">
                      <span>{item.payload.label}</span>
                      <span className="font-mono tabular-nums">{formatMoney(Number(value), { compact: true })}</span>
                    </span>
                  )}
                />
              }
            />
            <Pie
              data={slices}
              dataKey="amount"
              nameKey="key"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="95%"
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} dy="-0.4em" className="fill-foreground text-xl font-bold">
                        {formatMoney(free, { compact: true })}
                      </tspan>
                      <tspan x={viewBox.cx} dy="1.6em" className="fill-muted-foreground text-xs">
                        non alloué
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </ClientOnly>

      <ul className="grid gap-2 text-sm">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full" style={{ background: slice.color }} />
            <span className="min-w-0 flex-1 truncate">{slice.label}</span>
            <span className="text-muted-foreground tabular-nums">{formatMoney(slice.amount, { compact: true })}</span>
            <span className="w-12 text-right font-medium tabular-nums">{percentOf(slice.amount, income)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function buildSlices({ income, fixed, envelopes }: AllocationChartProps) {
  const allocated = envelopes.reduce((total, e) => total + e.amount, 0)
  const free = Math.max(0, income - fixed - allocated)

  return [
    { key: 'fixed', label: 'Charges fixes', amount: fixed, color: 'var(--chart-5)' },
    ...envelopes.map((envelope, index) => ({
      ...envelope,
      color: PALETTE[index % PALETTE.length]!,
    })),
    { key: 'free', label: 'Non alloué', amount: free, color: 'var(--muted)' },
  ].filter((slice) => slice.amount > 0)
}
