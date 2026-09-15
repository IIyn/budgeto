import { createHash, randomBytes } from 'node:crypto'

export function generateToken() {
  return randomBytes(32).toString('base64url')
}

/** Only token hashes are persisted, so a database leak does not expose usable tokens. */
export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
