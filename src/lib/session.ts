// lib/session.ts
import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

export interface SessionPayload {
  sub: string
  email: string
  nim: string | null
  name: string | null
  picture: string | null
  iat: number
}

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'user_session'
const SESSION_MAX_AGE_DAYS = Number(process.env.SESSION_MAX_AGE_DAYS || 7)

const RAW_SECRET = process.env.SESSION_SECRET
if (!RAW_SECRET) {
  throw new Error('SESSION_SECRET is required in environment variables')
}
const SECRET: string = RAW_SECRET

const toBase64Url = (str: string): string =>
  Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

const fromBase64Url = (str: string): string => {
  const pad = (s: string) => s + '='.repeat((4 - (s.length % 4)) % 4)
  return Buffer.from(pad(str).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

function sign(payload: SessionPayload): string {
  const data = toBase64Url(JSON.stringify(payload))
  const sig = toBase64Url(createHmac('sha256', SECRET).update(data).digest('base64'))
  return `${data}.${sig}`
}

function verify(token: string): SessionPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [data, sig] = parts
  const expectedSig = toBase64Url(createHmac('sha256', SECRET).update(data).digest('base64'))

  if (sig !== expectedSig) return null

  try {
    const parsed = JSON.parse(fromBase64Url(data))
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.sub === 'string' &&
      typeof parsed.email === 'string' &&
      (parsed.nim === null || typeof parsed.nim === 'string') &&
      (parsed.name === null || typeof parsed.name === 'string') &&
      (parsed.picture === null || typeof parsed.picture === 'string') &&
      typeof parsed.iat === 'number'
    ) {
      return parsed as SessionPayload
    }
  } catch {
    // ignore
  }
  return null
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: sign(payload),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verify(token)
}