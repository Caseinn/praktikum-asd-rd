// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { CodeChallengeMethod } from 'google-auth-library'
import { genCodeVerifier, genCodeChallenge, genState } from '@/lib/pkce'
import { applyCorsHeaders, resolveAllowedOrigin } from '@/lib/cors'

export const runtime = 'nodejs'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
)

export async function GET(request: NextRequest) {
  const { allowed, origin } = resolveAllowedOrigin(request.headers.get('origin'))
  if (!allowed || !origin) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  const codeVerifier = genCodeVerifier()
  const codeChallenge = genCodeChallenge(codeVerifier)
  const state = genState()

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email'],
    prompt: 'select_account',
    // 'hd' is only a hint; we still hard-check domain later
    hd: 'student.itera.ac.id',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256, // ✅ enum
  })

  const res = NextResponse.json({ url })
  applyCorsHeaders(res.headers, origin)
  // store nonce in httpOnly cookies for callback verification
  res.cookies.set({
    name: 'oauth_state',
    value: state,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  })
  res.cookies.set({
    name: 'pkce_verifier',
    value: codeVerifier,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 10 * 60,
  })
  return res
}
