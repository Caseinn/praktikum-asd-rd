import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Clock,
  Calendar,
  XCircle,
  CheckCircle2,
  MapPin,
  Download,
  ArrowLeft,
} from "lucide-react";
import { formatWIB } from "@/lib/time";

type SessionStatus = "ACTIVE" | "UPCOMING" | "EXPIRED";

type AttendanceListProps = {
  role: "ADMIN" | "STUDENT";
  userId: string;
  basePath: string;
};

function getStatus(now: Date, startTime: Date, endTime: Date): SessionStatus {
  if (now < startTime) return "UPCOMING";
  if (now > endTime) return "EXPIRED";
  return "ACTIVE";
}

export default async function AttendanceList({
  role,
  userId,
  basePath,
}: AttendanceListProps) {
  const subtitle =
    role === "ADMIN"
      ? "Pilih sesi untuk melihat rekap dan mengatur presensi."
      : "Pilih sesi yang aktif untuk melakukan check-in.";
  const backHref = role === "ADMIN" ? "/dashboard/admin" : "/dashboard/student";
  const sessions = await prisma.attendanceSession.findMany({
    orderBy: { startTime: "desc" },
    take: 30,
  });

  const now = new Date();
  let attendedIds = new Set<string>();
  if (role !== "ADMIN" && sessions.length > 0) {
    const records = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        sessionId: { in: sessions.map((s) => s.id) },
      },
      select: { sessionId: true },
    });
    attendedIds = new Set(records.map((r) => r.sessionId));
  }

  return (
    <main className="relative space-y-6 p-4 sm:p-6 animate-fade-up">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-fd-foreground">Presensi</h1>
          <p className="text-sm text-fd-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {role === "ADMIN" && (
            <>
              <a
                href="/api/attendance/export"
                download="presensi.csv"
                className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-sm font-medium text-fd-foreground transition hover:bg-fd-muted"
              >
                <Download className="h-4 w-4" />
                Unduh CSV
              </a>
              <Link
                href="/dashboard/admin/attendance/new"
                replace
                className="inline-flex items-center gap-1.5 rounded-md bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <MapPin className="h-4 w-4" />
                Buat Sesi
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map((s) => {
          const status = getStatus(now, s.startTime, s.endTime);
          const alreadyChecked = attendedIds.has(s.id);
          const canCheckIn = role !== "ADMIN" && status === "ACTIVE" && !alreadyChecked;

          return (
            <div
              key={s.id}
              className="rounded-xl border border-fd-border bg-fd-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-fd-foreground">{s.title}</h2>
                    {status === "ACTIVE" && (
                      <span className="status-chip" data-tone="active">
                        <Clock className="h-3 w-3" />
                        Aktif
                      </span>
                    )}
                    {status === "UPCOMING" && (
                      <span className="status-chip" data-tone="upcoming">
                        <Calendar className="h-3 w-3" />
                        Akan datang
                      </span>
                    )}
                    {status === "EXPIRED" && (
                      <span className="status-chip" data-tone="expired">
                        <XCircle className="h-3 w-3" />
                        Berakhir
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-fd-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatWIB(s.startTime)} - {formatWIB(s.endTime)}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Radius: {s.radius} meter
                    </p>
                  </div>
                </div>

                {role === "ADMIN" && (
                  <div className="mt-2 sm:mt-0">
                    <Link
                      href={`${basePath}/${s.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-sm font-medium text-fd-foreground transition hover:bg-fd-muted"
                    >
                      Detail
                    </Link>
                  </div>
                )}

                {role !== "ADMIN" && (
                  <div className="mt-2 sm:mt-0">
                    {alreadyChecked ? (
                      <span className="status-chip" data-tone="active">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Sudah Presensi
                      </span>
                    ) : canCheckIn ? (
                      <Link
                        href={`${basePath}/${s.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground transition hover:opacity-90"
                      >
                        Check-in
                      </Link>
                    ) : (
                      <span
                        className="status-chip"
                        data-tone={status === "UPCOMING" ? "upcoming" : "expired"}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {status === "UPCOMING" ? "Belum mulai" : "Sesi berakhir"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="rounded-xl border border-fd-border bg-fd-card p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-fd-muted-foreground" />
            <p className="mt-2 text-sm text-fd-muted-foreground">Belum ada sesi presensi.</p>
          </div>
        )}
      </div>
    </main>
  );
}
