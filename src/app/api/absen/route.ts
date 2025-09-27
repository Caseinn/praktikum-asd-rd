// app/api/absen/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || 'user_session'
const GAS_URL = process.env.GAS_ABSEN_URL!
const DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'student.itera.ac.id'

export async function POST(req: Request) {
  if (!GAS_URL) return NextResponse.json({ ok: false, msg: 'GAS URL not configured' }, { status: 500 })

  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })

  let session: any
  try { session = JSON.parse(raw) } catch { return NextResponse.json({ ok: false, msg: 'Invalid session' }, { status: 401 }) }

  const email: string = session?.email || ''
  if (!email.endsWith(`@${DOMAIN}`)) return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })

  const { coords } = await req.json().catch(() => ({}))

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, coords: coords ?? null }),
  })

  const data = await res.json().catch(() => ({ ok: false, msg: 'Invalid GAS response' }))
  return NextResponse.json(data, { status: res.ok ? 200 : 400 })
}
