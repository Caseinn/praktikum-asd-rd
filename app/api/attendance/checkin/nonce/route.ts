import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueCheckinNonce } from "@/lib/checkin-nonce";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const limitKey = getRateLimitKey(req, "attendance-checkin-nonce", session.user.email);
  const limit = await checkRateLimit(limitKey, { windowMs: 60_000, max: 30 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId")?.trim() ?? "";
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID wajib diisi." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, nim: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }
  if (!user.nim) {
    return NextResponse.json({ error: "NIM tidak terdeteksi dari email." }, { status: 400 });
  }

  const roster = await prisma.studentRoster.findUnique({
    where: { nim: user.nim },
    select: { isActive: true },
  });
  if (!roster?.isActive) {
    return NextResponse.json({ error: "Roster tidak aktif." }, { status: 403 });
  }

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: { id: true, startTime: true, endTime: true },
  });
  if (!attendanceSession) {
    return NextResponse.json({ error: "Sesi presensi tidak ditemukan." }, { status: 404 });
  }

  const now = new Date();
  if (now < attendanceSession.startTime || now > attendanceSession.endTime) {
    return NextResponse.json(
      { error: "Sesi presensi belum aktif atau sudah berakhir." },
      { status: 400 }
    );
  }

  const nonce = await issueCheckinNonce(user.id, attendanceSession.id);
  const res = NextResponse.json({ nonce });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
