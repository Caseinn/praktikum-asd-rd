// app/api/absen/route.ts
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const GAS_URL = process.env.GAS_ABSEN_URL!
const DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'student.itera.ac.id'

interface Coords {
  lat: number
  lng: number
}

function isValidCoords(value: unknown): value is Coords {
  return (
    value !== null &&
    typeof value === 'object' &&
    'lat' in value &&
    'lng' in value &&
    typeof (value as Record<string, unknown>).lat === 'number' &&
    typeof (value as Record<string, unknown>).lng === 'number'
  )
}

export async function POST(req: Request) {
  if (!GAS_URL) {
    return NextResponse.json({ ok: false, msg: 'GAS URL not configured' }, { status: 500 })
  }

  const session = await getSession()
  if (!session) {
    return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  }

  if (!session.email.endsWith(`@${DOMAIN}`)) {
    return NextResponse.json({ ok: false, msg: 'Unauthorized' }, { status: 401 })
  }

  let body: { coords?: unknown } = {}
  try {
    body = await req.json()
  } catch {
    // leave empty
  }

  const coords = isValidCoords(body.coords) ? body.coords : null

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: session.email, coords }),
  })

  let payload: { ok: boolean; msg: string; already?: boolean }
  try {
    const json = await res.json()
    if (typeof json === 'object' && json !== null && typeof (json as any).ok === 'boolean') {
      payload = json as typeof payload
    } else {
      throw new Error('Invalid')
    }
  } catch {
    payload = { ok: false, msg: 'Invalid GAS response' }
  }

  return NextResponse.json(payload, { status: res.ok ? 200 : 400 })
}