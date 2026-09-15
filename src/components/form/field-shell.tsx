import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FieldShellProps = {
  id: string
  label: string
  description?: string
  errors: unknown[]
  className?: string
  children: ReactNode
}

/** Label + control + description/errors, shared by every form field. */
export function FieldShell({ id, label, description, errors, className, children }: FieldShellProps) {
  const messages = errors.map(toMessage).filter(Boolean)

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {messages.length > 0 ? (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {messages[0]}
        </p>
      ) : description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}
    </div>
  )
}

function toMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  return null
}
