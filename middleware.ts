import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}'`,
  ].join("; ");
}

function getAllowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;

  const allowed = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (origin === req.nextUrl.origin) return origin;
  if (allowed.includes(origin)) return origin;

  return null;
}

function applyCorsHeaders(req: NextRequest, res: NextResponse) {
  const origin = getAllowedOrigin(req);
  if (!origin) return;

  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith("/api")) {
    const nonce = crypto.randomUUID();
    res.headers.set("Content-Security-Policy", buildCsp(nonce));
    res.headers.set("x-nonce", nonce);
    return res;
  }

  if (pathname !== "/api/csrf") {
    applyCorsHeaders(req, res);
  }

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: res.headers });
  }

  if (pathname.startsWith("/api/auth") || pathname === "/api/csrf") {
    return res;
  }

  const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  const csrfHeader = req.headers.get(CSRF_HEADER_NAME);

  if (!SAFE_METHODS.has(req.method)) {
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json(
        { error: "Token CSRF tidak valid." },
        { status: 403, headers: res.headers }
      );
    }
    return res;
  }

  if (!csrfCookie) {
    const token = crypto.randomUUID();
    res.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
