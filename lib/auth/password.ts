import crypto from 'crypto'

const ITERATIONS = 100_000
const KEY_LENGTH = 64
const DIGEST = 'sha512'

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'))
}
