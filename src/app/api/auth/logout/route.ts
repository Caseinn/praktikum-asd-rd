// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'user_session'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 0,
  })
  return res
}
