// app/api/absen/route.ts
import { NextResponse } from 'next/server';
const GAS_URL = process.env.GAS_URL!;

export async function POST(req: Request) {
  const { nim } = await req.json();
  if (!/^\d{6,15}$/.test(String(nim))) {
    return NextResponse.json({ ok:false, msg:'Format NIM tidak valid.' }, { status: 400 });
  }
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nim }),
  });
  const text = await res.text();
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return NextResponse.json({ ok:false, msg:`Balasan bukan JSON. Status: ${res.status}. Cuplikan: ${text.slice(0,120)}...` }, { status: 502 });
  }
  return NextResponse.json(JSON.parse(text), { status: res.ok ? 200 : 500 });
}
