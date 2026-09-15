import { createLink } from '@tanstack/react-router'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { type ComponentProps, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type SettingsRowProps = ComponentProps<'a'> & {
  icon: LucideIcon
  title: string
  description: string
  tone?: string
}

const SettingsRow = forwardRef<HTMLAnchorElement, SettingsRowProps>(
  ({ icon: Icon, title, description, tone = 'bg-primary/12 text-primary', className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn('hover:bg-accent/60 flex items-center gap-3 px-4 py-3 transition-colors', className)}
      {...props}
    >
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tone)}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="text-muted-foreground block truncate text-sm">{description}</span>
      </span>
      <ChevronRight className="text-muted-foreground size-4" />
    </a>
  ),
)

/** A type-safe router link styled as a settings row. */
export const SettingsLink = createLink(SettingsRow)
