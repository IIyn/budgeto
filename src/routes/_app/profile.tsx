import { createFileRoute } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { useLogout } from '@/components/layout/user-menu'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordCard } from '@/features/profile/components/password-card'
import { ProfileCard } from '@/features/profile/components/profile-card'
import { ThemeSwitcher } from '@/features/theme/theme-switcher'

export const Route = createFileRoute('/_app/profile')({
  head: () => ({ meta: [{ title: 'Mon profil — Budgeto' }] }),
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext()
  const logout = useLogout()

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-10">
      <PageHeader title="Mon profil" back={{ to: '/' }} />
      {/* Remounts the form with fresh defaults after the name changes. */}
      <ProfileCard key={user.displayName} user={user} />
      <PasswordCard />
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>
      <Button variant="outline" size="lg" className="text-destructive" onClick={logout}>
        <LogOut />
        Se déconnecter
      </Button>
    </main>
  )
}
