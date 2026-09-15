import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '@/server/auth/password.server'
import { createSession, destroySession, getSessionUser } from '@/server/auth/session.server'
import { db } from '@/server/db/client.server'
import { isUniqueViolation } from '@/server/db/errors.server'
import { users } from '@/server/db/schema'
import { loginSchema, signupSchema } from './auth.schemas'

// Verifying against a dummy hash when the user does not exist keeps response times similar.
let dummyHash: Promise<string> | undefined

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(() => getSessionUser())

export const loginFn = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const user = await db.query.users.findFirst({ where: eq(users.username, data.username) })
    dummyHash ??= hashPassword('dummy-password')
    const valid = await verifyPassword(data.password, user?.passwordHash ?? (await dummyHash))

    if (!user || !valid) throw new Error('Identifiant ou mot de passe incorrect')

    await createSession(user.id)
    return { id: user.id }
  })

export const signupFn = createServerFn({ method: 'POST' })
  .validator(signupSchema)
  .handler(async ({ data }) => {
    const passwordHash = await hashPassword(data.password)
    try {
      const [user] = await db
        .insert(users)
        .values({ username: data.username, displayName: data.username, passwordHash })
        .returning({ id: users.id })

      await createSession(user!.id)
      return { id: user!.id }
    } catch (error) {
      if (isUniqueViolation(error)) throw new Error('Cet identifiant est déjà utilisé')
      throw error
    }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  await destroySession()
})
