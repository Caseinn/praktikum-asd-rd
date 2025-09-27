// lib/pkce.ts
import crypto from 'crypto'

export function base64url(buf: Buffer | string) {
  return (typeof buf === 'string' ? Buffer.from(buf) : buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function genCodeVerifier() {
  return base64url(crypto.randomBytes(32))
}

export function genCodeChallenge(codeVerifier: string) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  return base64url(hash)
}

export function genState() {
  return base64url(crypto.randomBytes(16))
}
