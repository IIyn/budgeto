import { cn } from '@/lib/utils'

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-lg font-bold tracking-tight', className)}>
      <img src="/favicon.svg" alt="" className="size-8" />
      Budgeto
    </span>
  )
}
