// app/api/session/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(process.env.SESSION_COOKIE_NAME || 'user_session')?.value
  if (raw) {
    try {
      const user = JSON.parse(raw)
      return NextResponse.json({ user })
    } catch {}
  }
  return NextResponse.json({ user: null })
}
