import { deleteCookie, getCookie, getRequestProtocol, setCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import type { SessionUser } from '@/features/auth/auth.schemas'
import { db } from '../db/client.server'
import { sessions, users } from '../db/schema'
import { env } from '../env.server'
import { generateToken, hashToken } from './tokens.server'

const SESSION_COOKIE = 'budgeto_session'
const DAY = 24 * 60 * 60 * 1000

export async function createSession(userId: string) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + env.SESSION_DAYS * DAY)
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt })
  writeSessionCookie(token, expiresAt)
}

/** Returns the signed-in user, or `null`. Sessions are extended when half of their lifetime is used. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = getCookie(SESSION_COOKIE)
  if (!token) return null

  const sessionId = hashToken(token)
  const [row] = await db
    .select({
      expiresAt: sessions.expiresAt,
      id: users.id,
      username: users.username,
      displayName: users.displayName,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, sessionId))
    .limit(1)

  if (!row) return null

  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    return null
  }

  const lifetime = env.SESSION_DAYS * DAY
  if (row.expiresAt.getTime() - Date.now() < lifetime / 2) {
    const expiresAt = new Date(Date.now() + lifetime)
    await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, sessionId))
    writeSessionCookie(token, expiresAt)
  }

  return { id: row.id, username: row.username, displayName: row.displayName }
}

export async function destroySession() {
  const token = getCookie(SESSION_COOKIE)
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)))
  deleteCookie(SESSION_COOKIE, { path: '/' })
}

export async function destroyAllSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId))
}

/**
 * Secure cookies need HTTPS, decided per request: the same Pi is reached over HTTPS through Cloudflare Tunnel
 * (which sets X-Forwarded-Proto) and over plain HTTP on the LAN. Trusting the header is harmless here:
 * a spoofed value only changes the Secure flag of the caller's own cookie.
 */
function writeSessionCookie(token: string, expiresAt: Date) {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getRequestProtocol({ xForwardedProto: true }) === 'https',
    path: '/',
    expires: expiresAt,
  })
}
