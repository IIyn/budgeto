import { createFileRoute } from '@tanstack/react-router'
import { Brand } from '@/components/layout/brand'
import { authQueries } from '@/features/auth/auth.queries'
import { InvitationCard } from '@/features/members/components/invitation-card'
import { getInvitationFn } from '@/features/members/members.functions'
import { invitationTokenSchema } from '@/features/members/members.schemas'

export const Route = createFileRoute('/invite/$token')({
  // Full SSR on purpose: messaging apps read the Open Graph tags to build the link preview.
  ssr: true,
  loader: async ({ context, params }) => {
    const valid = invitationTokenSchema.safeParse({ token: params.token }).success
    const [invitation, user] = await Promise.all([
      valid ? getInvitationFn({ data: { token: params.token } }) : null,
      context.queryClient.ensureQueryData(authQueries.currentUser()),
    ])
    return { invitation, user }
  },
  head: ({ loaderData }) => {
    const invitation = loaderData?.invitation
    const title = invitation ? `Rejoignez « ${invitation.budgetName} » sur Budgeto` : 'Invitation Budgeto'
    const description = invitation
      ? `${invitation.inviterName} vous invite à gérer ce budget ensemble.`
      : 'Gérez votre budget mensuel seul ou à plusieurs.'
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'noindex' },
      ],
    }
  },
  component: InvitePage,
})

function InvitePage() {
  const { token } = Route.useParams()
  const { invitation, user } = Route.useLoaderData()

  return (
    <main className="from-primary/15 via-background to-background flex min-h-dvh flex-col items-center bg-linear-to-b px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-8">
      <Brand className="mb-8 text-2xl" />
      <div className="w-full max-w-sm">
        <InvitationCard token={token} invitation={invitation} user={user} />
      </div>
    </main>
  )
}
