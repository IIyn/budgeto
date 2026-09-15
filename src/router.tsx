import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { toast } from 'sonner'
import { DefaultCatchBoundary } from '@/components/layout/default-catch-boundary'
import { NotFound } from '@/components/layout/not-found'
import { UNAUTHORIZED_MESSAGE } from '@/features/auth/auth.schemas'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const onError = (error: Error) => {
    if (typeof window === 'undefined') return
    if (error.message === UNAUTHORIZED_MESSAGE) {
      queryClient.clear()
      void router.navigate({ to: '/login', search: { redirect: window.location.pathname } })
    }
  }

  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({
      onError: (error) => {
        onError(error)
        if (error.message !== UNAUTHORIZED_MESSAGE) toast.error(error.message)
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30 * 1000, retry: 1 },
    },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    // Preloaded data is owned by TanStack Query, so the router cache must not keep its own copy.
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: NotFound,
  })

  // Dehydrates queries fetched during SSR and streams the ones still pending into the HTML.
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
