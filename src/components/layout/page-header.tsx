import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type PageHeaderProps = {
  title: string
  description?: string
  back?: Pick<LinkProps, 'to' | 'params' | 'search'>
  action?: ReactNode
}

export function PageHeader({ title, description, back, action }: PageHeaderProps) {
  return (
    <div className="flex items-start gap-2">
      {back && (
        <Button variant="ghost" size="icon-lg" className="-ml-2 shrink-0" asChild>
          <Link {...back} aria-label="Retour">
            <ChevronLeft />
          </Link>
        </Button>
      )}
      <div className="min-w-0 flex-1 pt-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {action}
    </div>
  )
}
