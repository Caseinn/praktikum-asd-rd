// app/api/session/route.ts
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({
    user: {
      email: session.email,
      nim: session.nim,
    }
  })
}