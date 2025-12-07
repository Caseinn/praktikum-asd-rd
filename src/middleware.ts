import { NextRequest, NextResponse } from 'next/server'
import { applyCorsHeaders, resolveAllowedOrigin } from '@/lib/cors'

export function middleware(request: NextRequest) {
  const originHeader = request.headers.get('origin')
  const { allowed, origin } = resolveAllowedOrigin(originHeader)

  if (!allowed) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  if (request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 })
    if (origin) {
      applyCorsHeaders(preflight.headers, origin)
      preflight.headers.set('Access-Control-Max-Age', '86400')
    }
    return preflight
  }

  const response = NextResponse.next()
  if (origin) {
    applyCorsHeaders(response.headers, origin)
  }
  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
