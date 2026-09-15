import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const COLORS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5', 'bg-chart-7']

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const color = COLORS[[...name].reduce((total, char) => total + char.charCodeAt(0), 0) % COLORS.length]

  return (
    <Avatar className={cn('size-9', className)}>
      <AvatarFallback className={cn('font-semibold text-white', color)}>{initials}</AvatarFallback>
    </Avatar>
  )
}
