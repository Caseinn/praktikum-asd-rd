import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { CSRF_COOKIE_NAME } from "@/lib/csrf";

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const token = existing ?? randomUUID();

  const res = NextResponse.json({ token });
  res.headers.set("Cache-Control", "no-store");
  if (!existing) {
    res.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return res;
}
