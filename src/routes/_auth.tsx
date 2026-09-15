import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Brand } from '@/components/layout/brand'
import { authQueries } from '@/features/auth/auth.queries'
import { redirectSearchSchema } from '@/features/auth/auth.schemas'

/** Public layout for login and signup. Signed-in users are sent back where they came from. */
export const Route = createFileRoute('/_auth')({
  validateSearch: redirectSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData(authQueries.currentUser())
    if (user) throw redirect({ href: search.redirect ?? '/' })
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <main className="from-primary/15 via-background to-background flex min-h-dvh flex-col items-center bg-linear-to-b px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-8">
      <Brand className="mb-8 text-2xl" />
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </main>
  )
}
