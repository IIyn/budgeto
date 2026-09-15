import { createMiddleware } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { getSessionUser } from '@/server/auth/session.server'
import { UNAUTHORIZED_MESSAGE } from './auth.schemas'

/** Server function middleware: resolves the session and exposes `context.user`, or rejects with 401. */
export const authMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await getSessionUser()
  if (!user) {
    setResponseStatus(401)
    throw new Error(UNAUTHORIZED_MESSAGE)
  }
  return next({ context: { user } })
})
