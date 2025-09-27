// app/api/auth/callback/route.ts
import { google } from 'googleapis'
import { OAuth2Client, type TokenPayload } from 'google-auth-library'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!
const DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'student.itera.ac.id'
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'user_session'
const SESSION_MAX_AGE_DAYS = Number(process.env.SESSION_MAX_AGE_DAYS || 7)

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  `${APP_URL}/api/auth/callback`
)

type SessionPayload = {
  sub: string
  email: string
  nim: string | null
  name: string | null
  picture: string | null
  iat: number
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('oauth_state')?.value
  const codeVerifier = cookieStore.get('pkce_verifier')?.value

  const cleanup = (res: NextResponse) => {
    res.cookies.set({ name: 'oauth_state', value: '', path: '/', maxAge: 0 })
    res.cookies.set({ name: 'pkce_verifier', value: '', path: '/', maxAge: 0 })
  }

  if (error) {
    const res = NextResponse.json({ error }, { status: 400 }); cleanup(res); return res
  }
  if (!code || !state) {
    const res = NextResponse.json({ error: 'Missing code/state' }, { status: 400 }); cleanup(res); return res
  }
  if (!savedState || state !== savedState) {
    const res = NextResponse.json({ error: 'Invalid state' }, { status: 400 }); cleanup(res); return res
  }
  if (!codeVerifier) {
    const res = NextResponse.json({ error: 'Missing PKCE verifier' }, { status: 400 }); cleanup(res); return res
  }

  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      codeVerifier,
      redirect_uri: `${APP_URL}/api/auth/callback`,
    })

    if (!tokens.id_token) {
      const res = NextResponse.json({ error: 'No ID token' }, { status: 400 }); cleanup(res); return res
    }

    // verify ID token (audience & issuer)
    const verifier = new OAuth2Client(CLIENT_ID)
    const ticket = await verifier.verifyIdToken({ idToken: tokens.id_token, audience: CLIENT_ID })
    const payload: TokenPayload | undefined = ticket.getPayload()

    if (!payload || typeof payload.email !== 'string' || typeof payload.sub !== 'string') {
      const res = NextResponse.json({ error: 'Invalid ID token payload' }, { status: 400 }); cleanup(res); return res
    }

    const email = payload.email
    if (!email.endsWith(`@${DOMAIN}`)) {
      const res = NextResponse.json({ error: `Email harus @${DOMAIN}` }, { status: 403 }); cleanup(res); return res
    }

    // Try derive NIM from email: name.#########@student.itera.ac.id
    const nimMatch = email.match(/\.(\d{9})@student\.itera\.ac\.id$/)
    const nim: string | null = nimMatch ? nimMatch[1] : null

    const sessionValue: SessionPayload = {
      sub: payload.sub,
      email,
      nim,
      name: (typeof payload.name === 'string' ? payload.name : null) ?? null,
      picture: (typeof payload.picture === 'string' ? payload.picture : null) ?? null,
      iat: Math.floor(Date.now() / 1000),
    }

    const res = NextResponse.redirect(new URL('/absen', APP_URL))
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: JSON.stringify(sessionValue),
      httpOnly: true,
      sameSite: 'lax',
      // Use secure only in prod to allow localhost testing
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
    })
    cleanup(res)
    return res
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const res = NextResponse.json({ error: 'Login gagal', detail: message }, { status: 500 })
    cleanup(res)
    return res
  }
}
