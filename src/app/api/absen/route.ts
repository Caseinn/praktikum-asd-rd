// app/api/absen/route.ts
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

const GAS_URL = process.env.GAS_URL || ''

const hits = new Map<string, { count: number; ts: number }>()
function rateLimit(ip: string, limit = 20, windowMs = 60_000) {
  const now = Date.now()
  const rec = hits.get(ip) || { count: 0, ts: now }
  if (now - rec.ts > windowMs) { rec.count = 0; rec.ts = now }
  rec.count++; hits.set(ip, rec)
  return rec.count <= limit
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'local'
    if (!rateLimit(ip)) {
      return NextResponse.json({ ok:false, msg:'Terlalu banyak percobaan. Coba lagi sebentar.' }, { status: 429 })
    }

    const { nim, deviceId, coords } = await req.json()
    if (!/^\d{6,15}$/.test(String(nim))) {
      return NextResponse.json({ ok:false, msg:'Format NIM tidak valid.' }, { status: 400 })
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
      // kirim pesan jelas ke client agar kamu tahu kalau URL/akses GAS salah
      return NextResponse.json({
        ok:false,
        msg:`Balasan bukan JSON dari GAS. Status: ${res.status}.`
      }, { status: 502 })
    }

    return NextResponse.json(JSON.parse(raw), { status: res.ok ? 200 : 500 })
  } catch (e: any) {
    return NextResponse.json({ ok:false, msg: e?.message || 'Server error' }, { status: 500 })
  }
}
