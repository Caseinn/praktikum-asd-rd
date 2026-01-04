import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarCheck, UserCheck, ArrowLeft } from "lucide-react";
import { formatWIB } from "@/lib/time";
import { LogoutButton } from "@/components/shared/logout-button";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      attendance: {
        include: { session: true },
        orderBy: { attendedAt: "desc" },
      },
    },
  });

  if (!user?.nim) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-fd-border bg-fd-card p-4 text-sm text-fd-foreground">
          NIM tidak terdeteksi dari email.
        </div>
      </div>
    );
  }

  // Ambil semua sesi yang sudah berakhir
  const now = new Date();
  const pastSessions = await prisma.attendanceSession.findMany({
    where: {
      endTime: { lt: now },
    },
  });

  const totalSesiLalu = pastSessions.length;
  const pastSessionIds = new Set(pastSessions.map((s) => s.id));
  const pastAttendance = user.attendance.filter((a) => pastSessionIds.has(a.sessionId));
  const hadirCount = pastAttendance.filter((a) => a.status === "HADIR").length;
  const izinCount = pastAttendance.filter((a) => a.status === "IZIN").length;
  const tidakHadirCount = Math.max(totalSesiLalu - hadirCount - izinCount, 0);
  const totalRecorded = hadirCount + izinCount + tidakHadirCount;
  const attendanceRate =
    totalRecorded > 0 ? Math.round(((hadirCount + izinCount) / totalRecorded) * 100) : 0;

  return (
    <main className="space-y-8 p-4 sm:p-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>
      <section className="rounded-2xl border border-fd-border bg-fd-foreground p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap sm:justify-between">

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fd-background text-fd-foreground">
              <UserCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-base font-semibold text-fd-background sm:text-xl">
                Halo, {session.user.name ?? "Mahasiswa"}
              </h1>
              <p className="text-xs text-fd-background sm:text-sm">
                NIM: {user.nim}
              </p>
            </div>
          </div>

          <div className="flex w-full justify-end sm:w-auto">
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-fd-border bg-fd-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-fd-foreground">
              Statistik Kehadiran
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-fd-border bg-fd-background p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
                Hadir
              </p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--color-fd-success)]">
                {hadirCount}
              </p>
            </div>
            <div className="rounded-lg border border-fd-border bg-fd-background p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
                Izin
              </p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--color-fd-warning)]">
                {izinCount}
              </p>
            </div>
            <div className="rounded-lg border border-fd-border bg-fd-background p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
                Tidak hadir
              </p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--color-fd-error)]">
                {tidakHadirCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-fd-border bg-fd-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
            Konsistensi
          </p>
          <p className="mt-2 text-3xl font-semibold text-fd-foreground">
            {attendanceRate}%
          </p>
          <p className="mt-1 text-sm text-fd-muted-foreground">
            Persentase kehadiran berdasarkan sesi yang sudah berakhir.
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-fd-muted">
            <div
              className="h-full rounded-full bg-fd-primary transition-all"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-fd-border bg-fd-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-fd-foreground">
              Presensi Hari Ini
            </h2>
            <p className="text-sm text-fd-muted-foreground">
              Masuk ke sesi aktif dan lakukan check-in.
            </p>
          </div>
          <Link
            href="/dashboard/student/attendance"
            className="inline-flex items-center gap-2 rounded-md bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Presensi Sekarang
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-fd-foreground">Riwayat Presensi</h2>
        {user.attendance.length === 0 ? (
          <div className="rounded-xl border border-fd-border bg-fd-card p-6 text-center">
            <CalendarCheck className="mx-auto h-8 w-8 text-fd-muted-foreground" />
            <p className="mt-2 text-sm text-fd-muted-foreground">Belum ada presensi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {user.attendance.map((a) => {
              const tone =
                a.status === "HADIR"
                  ? "active"
                  : a.status === "IZIN"
                  ? "notice"
                  : "expired";
              const label =
                a.status === "HADIR"
                  ? "Hadir"
                  : a.status === "IZIN"
                  ? "Izin"
                  : "Tidak hadir";

              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-fd-border bg-fd-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 text-fd-muted-foreground">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-fd-foreground">{a.session.title}</p>
                      <p className="text-xs text-fd-muted-foreground">
                        {formatWIB(a.attendedAt)}
                      </p>
                    </div>
                  </div>
                  <span className="status-chip" data-tone={tone}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

