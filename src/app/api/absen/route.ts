// app/api/absen/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || 'user_session'
const GAS_URL = process.env.GAS_ABSEN_URL!
const DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'student.itera.ac.id'

type Coords = { lat: number; lng: number }
type Session = { email: string; nim?: string } & Record<string, unknown>

function parseJSON<T>(raw: string): T | null {
  try { return JSON.parse(raw) as T } catch { return null }
}

function isCoords(v: unknown): v is Coords {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Record<string, unknown>).lat === 'number' &&
    typeof (v as Record<string, unknown>).lng === 'number'
  )
}

export async function POST(req: Request) {
  if (!GAS_URL) {
    return NextResponse.json({ ok: false, msg: 'GAS URL not configured' }, { status: 500 })
  }

  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) {
    return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  }

  const session = parseJSON<Session>(raw)
  if (!session || typeof session.email !== 'string') {
    return NextResponse.json({ ok: false, msg: 'Invalid session' }, { status: 401 })
  }

  const email = session.email
  if (!email.endsWith(`@${DOMAIN}`)) {
    return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  }

  // Body typing
  type Body = { coords?: unknown }
  const body = (await req.json().catch(() => ({}))) as Body
  const coords = isCoords(body.coords) ? body.coords : null

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, coords }),
  })

  const data = (await res.json().catch(() => null)) as unknown
  const payload = (data && typeof data === 'object') ? data : { ok: false, msg: 'Invalid GAS response' }

  return NextResponse.json(payload, { status: res.ok ? 200 : 400 })
}
