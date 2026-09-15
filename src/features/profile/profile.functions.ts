import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '@/server/auth/password.server'
import { createSession, destroyAllSessions } from '@/server/auth/session.server'
import { db } from '@/server/db/client.server'
import { users } from '@/server/db/schema'
import { authMiddleware } from '../auth/auth.middleware'
import { changePasswordSchema, updateProfileSchema } from './profile.schemas'

export const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateProfileSchema)
  .handler(async ({ data, context }) => {
    await db.update(users).set({ displayName: data.displayName }).where(eq(users.id, context.user.id))
  })

/** Changing the password signs out every other device. */
export const changePasswordFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(changePasswordSchema)
  .handler(async ({ data, context }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, context.user.id),
      columns: { passwordHash: true },
    })
    if (!user || !(await verifyPassword(data.currentPassword, user.passwordHash))) {
      throw new Error('Mot de passe actuel incorrect')
    }

    await db
      .update(users)
      .set({ passwordHash: await hashPassword(data.newPassword) })
      .where(eq(users.id, context.user.id))
    await destroyAllSessions(context.user.id)
    await createSession(context.user.id)
  })
