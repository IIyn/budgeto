/// <reference types="vite/client" />
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts, ScriptOnce } from '@tanstack/react-router'
import { lazy, type ReactNode, Suspense } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { getThemePreference, themeBootScript } from '@/features/theme/theme'
import { ThemeProvider } from '@/features/theme/theme-provider'
import appCss from '@/styles/app.css?url'

const Devtools = import.meta.env.DEV ? lazy(() => import('@/components/layout/devtools')) : () => null

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: () => ({ theme: getThemePreference() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'Budgeto — Votre budget, simplement' },
      { name: 'description', content: 'Gérez votre budget mensuel seul ou à plusieurs.' },
      { name: 'theme-color', content: '#6d4aff' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', href: '/favicon.svg' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootDocument({ children }: { children: ReactNode }) {
  const { theme } = Route.useRouteContext()

  return (
    <html lang="fr" className={theme === 'dark' ? 'dark' : undefined} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ScriptOnce>{themeBootScript}</ScriptOnce>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  const { theme } = Route.useRouteContext()

  return (
    <ThemeProvider theme={theme}>
      <Outlet />
      <Toaster position="top-center" richColors />
      <Suspense>
        <Devtools />
      </Suspense>
    </ThemeProvider>
  )
}
