import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authQueries } from '@/features/auth/auth.queries'

/** Guard for every signed-in page. Exposes `context.user` to child routes. */
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData(authQueries.currentUser())
    if (!user) throw redirect({ to: '/login', search: { redirect: location.href } })
    return { user }
  },
  component: Outlet,
})
