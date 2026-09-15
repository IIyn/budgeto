import { Link } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-accent text-accent-foreground flex size-14 items-center justify-center rounded-full">
        <Compass className="size-7" />
      </div>
      <h1 className="text-xl font-semibold">Page introuvable</h1>
      <p className="text-muted-foreground text-sm">Cette page n'existe pas ou vous n'y avez pas accès.</p>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}
