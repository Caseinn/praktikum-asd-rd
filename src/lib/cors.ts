const FALLBACK_ALLOWED_ORIGIN = 'https://praktikum-asd-rd.vercel.app'

const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL || FALLBACK_ALLOWED_ORIGIN]

function normalizeOrigin(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function resolveAllowedOrigin(originHeader: string | null) {
  const normalizedAllowed = allowedOrigins
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => Boolean(value))

  const normalizedRequest = normalizeOrigin(originHeader)
  const fallbackOrigin = normalizedAllowed[0] ?? FALLBACK_ALLOWED_ORIGIN

  if (normalizedRequest && normalizedAllowed.includes(normalizedRequest)) {
    return { allowed: true as const, origin: normalizedRequest }
  }

  if (!normalizedRequest) {
    return { allowed: true as const, origin: fallbackOrigin }
  }

  return { allowed: false as const, origin: null }
}

export function applyCorsHeaders(headers: Headers, origin: string) {
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.append('Vary', 'Origin')
}
