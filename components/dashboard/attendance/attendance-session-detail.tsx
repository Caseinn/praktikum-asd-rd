import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckinClient from "@/components/dashboard/attendance/checkin-client";
import AttendanceDataTable from "@/components/dashboard/attendance/attendance-data-table";
import { formatWIB } from "@/lib/time";
import {
  MapPin,
  Clock,
  Calendar,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

type AttendanceSessionDetailProps = {
  params: { sessionId: string };
  basePath: string;
  allowedRole?: "ADMIN" | "STUDENT";
};

type AttendanceRow = {
  nim: string;
  name: string;
  status: "HADIR" | "IZIN" | "TIDAK_HADIR" | "BELUM";
  attendedAt: Date | null;
};

function getSessionStatus(
  now: Date,
  startTime: Date,
  endTime: Date
): { label: string; tone: "active" | "upcoming" | "expired"; icon: React.ReactNode } {
  if (now < startTime) {
    return { label: "Akan datang", tone: "upcoming", icon: <Calendar className="h-3 w-3" /> };
  }
  if (now > endTime) {
    return { label: "Berakhir", tone: "expired", icon: <XCircle className="h-3 w-3" /> };
  }
  return { label: "Aktif", tone: "active", icon: <Clock className="h-3 w-3" /> };
}

export default async function AttendanceSessionDetail({
  params,
  basePath,
  allowedRole,
}: AttendanceSessionDetailProps) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const role = session.user.role ?? "STUDENT";
  if (allowedRole && role !== allowedRole) {
    const fallbackPath = allowedRole === "ADMIN"
      ? "/dashboard/student/attendance"
      : "/dashboard/admin/attendance";
    redirect(fallbackPath);
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: params.sessionId },
  });
  if (!attendanceSession) notFound();

  const record = await prisma.attendanceRecord.findUnique({
    where: { userId_sessionId: { userId: user.id, sessionId: attendanceSession.id } },
  });

  const now = new Date();
  const isActive = now >= attendanceSession.startTime && now <= attendanceSession.endTime;
  const isExpired = now > attendanceSession.endTime;
  const { label, tone, icon: statusIcon } = getSessionStatus(
    now,
    attendanceSession.startTime,
    attendanceSession.endTime
  );

  let attendanceRows: AttendanceRow[] = [];
  let extraRecords: Array<{ id: string; nim: string | null }> = [];
  if (role === "ADMIN") {
    const [roster, records] = await Promise.all([
      prisma.studentRoster.findMany({
        where: { isActive: true },
        orderBy: { nim: "asc" },
      }),
      prisma.attendanceRecord.findMany({
        where: { sessionId: attendanceSession.id },
        include: { user: true },
      }),
    ]);

    const rosterNims = new Set(roster.map((student) => student.nim));
    const recordByNim = new Map<string, typeof records[number]>();
    records.forEach((recordItem) => {
      if (recordItem.user.nim) {
        recordByNim.set(recordItem.user.nim, recordItem);
      }
    });

    attendanceRows = roster.map((student) => {
      const recordItem = recordByNim.get(student.nim);
      const status = recordItem?.status ?? (isExpired ? "TIDAK_HADIR" : "BELUM");
      return {
        nim: student.nim,
        name: student.fullName ?? "-",
        status,
        attendedAt: recordItem?.attendedAt ?? null,
      };
    });

    extraRecords = records
      .filter((recordItem) => !recordItem.user.nim || !rosterNims.has(recordItem.user.nim))
      .map((recordItem) => ({ id: recordItem.id, nim: recordItem.user.nim ?? null }));
  }

  const hadirCount = attendanceRows.filter((row) => row.status === "HADIR").length;
  const izinCount = attendanceRows.filter((row) => row.status === "IZIN").length;
  const tidakHadirCount = attendanceRows.filter((row) => row.status === "TIDAK_HADIR").length;
  const belumCount = attendanceRows.filter((row) => row.status === "BELUM").length;
  const tableRows = attendanceRows.map((row) => ({
    nim: row.nim,
    name: row.name,
    status: row.status,
    attendedAtLabel: row.attendedAt ? formatWIB(row.attendedAt) : "-",
  }));

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="w-full max-w-5xl rounded-2xl border border-fd-border bg-fd-card p-5 shadow-sm sm:p-6 md:p-7 lg:p-8">
        <div className="space-y-2">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-fd-foreground">
                {attendanceSession.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="status-chip" data-tone={tone}>
                  {statusIcon}
                  {label}
                </span>
                {role === "ADMIN" && (
                  <span className="status-chip">
                    Total Mahasiswa: {attendanceRows.length}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:gap-6 lg:gap-8">
          <div className="rounded-lg border border-fd-border bg-fd-background p-4">
            <div className="flex items-center gap-2 text-sm text-fd-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {formatWIB(attendanceSession.startTime)} - {formatWIB(attendanceSession.endTime)}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-fd-border bg-fd-background p-4">
            <div className="flex items-center gap-2 text-sm text-fd-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>Radius: {attendanceSession.radius} meter</span>
            </div>
          </div>
        </div>

        {role === "ADMIN" && (
          <div className="mt-4 rounded-lg border border-fd-border bg-fd-background px-4 py-3 sm:mt-5 md:mt-6">
            <p className="text-sm text-fd-muted-foreground">
              <span className="font-semibold text-fd-foreground">Rekap:</span>{" "}
              Hadir {hadirCount} · Izin {izinCount} · Tidak hadir {tidakHadirCount} ·{" "}
              {isExpired ? "Belum tercatat" : "Belum presensi"} {belumCount}
            </p>
          </div>
        )}

        {role !== "ADMIN" && label === "Aktif" && !record && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-fd-border bg-fd-muted p-4 text-sm sm:mt-6 md:mt-7">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-fd-foreground" />
            <span className="text-fd-foreground">
              Aktifkan izin lokasi agar presensi berjalan.
            </span>
          </div>
        )}

        <div className="mt-6 sm:mt-7 md:mt-8 lg:mt-10">
          {role === "ADMIN" ? (
            <div className="space-y-3">
              <AttendanceDataTable
                sessionId={attendanceSession.id}
                rows={tableRows}
              />

              {extraRecords.length > 0 && (
                <p className="text-xs text-fd-muted-foreground">
                  {extraRecords.length} presensi tanpa NIM roster.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-fd-border bg-fd-background p-4">
              <CheckinClient
                sessionId={attendanceSession.id}
                isActive={isActive}
                alreadyCheckedIn={Boolean(record)}
              />
            </div>
          )}
        </div>

        {role !== "ADMIN" && record && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-md bg-fd-muted px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-[color:var(--color-fd-success)]" />
            <span className="text-sm font-medium text-fd-foreground">
              Anda sudah presensi ({record.status})
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
