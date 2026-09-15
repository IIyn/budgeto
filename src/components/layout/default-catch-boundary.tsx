import { type ErrorComponentProps, Link, rootRouteId, useMatch, useRouter } from '@tanstack/react-router'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({ strict: false, select: (state) => state.id === rootRouteId })

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full">
        <TriangleAlert className="size-7" />
      </div>
      <h1 className="text-xl font-semibold">Oups, quelque chose s'est mal passé</h1>
      <p className="text-muted-foreground text-sm">
        {error instanceof Error ? error.message : 'Erreur inattendue'}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => router.invalidate()}>Réessayer</Button>
        {isRoot ? (
          <Button variant="outline" asChild>
            <Link to="/">Accueil</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={() => router.history.back()}>
            Retour
          </Button>
        )}
      </div>
    </div>
  )
}
