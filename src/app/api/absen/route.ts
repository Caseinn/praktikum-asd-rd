// app/api/absen/route.ts
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

const GAS_URL = process.env.GAS_URL || ''

const hits = new Map<string, { count: number; ts: number }>()
function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now()
  const rec = hits.get(key) || { count: 0, ts: now }
  if (now - rec.ts > windowMs) { rec.count = 0; rec.ts = now }
  rec.count++; hits.set(key, rec)
  return rec.count <= limit
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nim, deviceId, coords } = body;

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'local';
    const rateKey = deviceId ? `${ip}::${String(deviceId).slice(0, 8)}` : ip;

    if (!rateLimit(rateKey, 5)) {
      return NextResponse.json({
        ok: false,
        msg: 'Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.'
      }, { status: 429 });
    }


    if (!/^\d{9}$/.test(String(nim))) {
      return NextResponse.json({ ok:false, msg:'Format NIM harus 9 digit.' }, { status: 400 })
    }

    if (!GAS_URL) {
      return NextResponse.json({ ok:false, msg:'GAS_URL belum diset di .env.local' }, { status: 500 })
    }

    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ nim, deviceId, coords }),
      redirect: 'follow'
    })

    const ct = res.headers.get('content-type') || ''
    const raw = await res.text()

    if (!ct.includes('application/json')) {
      return NextResponse.json({
        ok:false,
        msg:`Balasan bukan JSON dari GAS. Status: ${res.status}.`
      }, { status: 502 })
    }

    return NextResponse.json(JSON.parse(raw), { status: res.ok ? 200 : 500 })

  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok:false, msg: err }, { status: 500 })
  }
}