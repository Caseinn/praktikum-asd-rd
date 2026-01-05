import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { AttendanceStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const ALLOWED_STATUSES: AttendanceStatus[] = ["HADIR", "IZIN", "TIDAK_HADIR"];

const MAX_BODY_BYTES = 100_000;
const MAX_NIMS = 200;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const limitKey = getRateLimitKey(req, "attendance-bulk", session.user.email);
  const limit = await checkRateLimit(limitKey, { windowMs: 60_000, max: 15 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload terlalu besar." }, { status: 413 });
  }

  let body: unknown = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const { sessionId: rawSessionId, status: rawStatusValue, nims: rawNimsValue } = body as Record<string, unknown>;

  const sessionId = typeof rawSessionId === "string" ? rawSessionId.trim() : "";
  const rawStatus = typeof rawStatusValue === "string" ? rawStatusValue.trim().toUpperCase() : "";
  const status = rawStatus as AttendanceStatus;
  const rawNims = Array.isArray(rawNimsValue) ? rawNimsValue : [];
  const nims = rawNims
    .filter((nim: unknown): nim is string => typeof nim === "string")
    .map((nim: string) => nim.trim())
    .filter(Boolean);
  const uniqueNims = Array.from(new Set<string>(nims));

  if (!sessionId || uniqueNims.length === 0) {
    return NextResponse.json(
      { error: "Session ID dan daftar NIM wajib diisi." },
      { status: 400 }
    );
  }
  if (uniqueNims.length > MAX_NIMS) {
    return NextResponse.json({ error: "Jumlah NIM terlalu banyak." }, { status: 413 });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });
  if (!attendanceSession) {
    return NextResponse.json({ error: "Sesi presensi tidak ditemukan." }, { status: 404 });
  }

  const users = await prisma.user.findMany({
    where: { nim: { in: uniqueNims } },
    select: { id: true, nim: true },
  });
  if (users.length === 0) {
    return NextResponse.json(
      { error: "Pengguna dengan NIM tersebut tidak ditemukan." },
      { status: 404 }
    );
  }

  const foundNims = new Set(users.map((user) => user.nim ?? ""));
  const missing = uniqueNims.filter((nim) => !foundNims.has(nim));

  const timestamp = new Date();
  const batchSize = 20;
  for (let i = 0; i < users.length; i += batchSize) {
    const chunk = users.slice(i, i + batchSize);
    await Promise.all(
      chunk.map((user) =>
        prisma.attendanceRecord.upsert({
          where: { userId_sessionId: { userId: user.id, sessionId } },
          update: { status, attendedAt: timestamp },
          create: { userId: user.id, sessionId, status, attendedAt: timestamp },
        })
      )
    );
  }

  const adminHash = session.user.email
    ? createHash("sha256").update(session.user.email).digest("hex")
    : null;

  console.info("[audit] attendance.bulk", {
    adminHash,
    sessionId,
    status,
    updated: users.length,
  });

  return NextResponse.json({ ok: true, updated: users.length, missing });
}
