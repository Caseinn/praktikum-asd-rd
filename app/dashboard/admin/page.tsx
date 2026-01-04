import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Calendar,
  MapPin,
  Plus,
  Clock,
  XCircle,
  UserCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";
import AccessDenied from "@/components/shared/access-denied";
import { formatWIB } from "@/lib/time";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (session.user.role !== "ADMIN") {
    return <AccessDenied backHref="/dashboard" backLabel="Kembali" />;
  }

  const now = new Date();
  const [sessions, activeCount, upcomingCount, expiredCount] = await Promise.all([
    prisma.attendanceSession.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.attendanceSession.count({
      where: { startTime: { lte: now }, endTime: { gte: now } },
    }),
    prisma.attendanceSession.count({
      where: { startTime: { gt: now } },
    }),
    prisma.attendanceSession.count({
      where: { endTime: { lt: now } },
    }),
  ]);

  return (
    <main className="space-y-8 p-4 sm:p-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-fd-border bg-fd-foreground p-6 shadow-sm">
          <div className="flex min-h-[96px] items-center">
            <div className="flex w-full flex-wrap items-center gap-4 sm:flex-nowrap sm:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fd-background text-fd-foreground">
                  <UserCheck className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-base font-semibold text-fd-background sm:text-xl">
                    Halo, {session.user.name ?? "Admin"}
                  </h1>
                  <p className="text-xs text-fd-background sm:text-sm">
                    Role: Admin
                  </p>
                </div>
              </div>

              <div className="flex w-full justify-end sm:w-auto">
                <LogoutButton />
              </div>

            </div>
          </div>
        </div>


        <div className="rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-fd-muted-foreground">
                Ringkasan Sesi
              </p>
              <h2 className="mt-2 text-lg font-semibold text-fd-foreground">
                {sessions.length} sesi terbaru
              </h2>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-fd-border bg-fd-background p-3 text-center">
              Aktif: {activeCount}
            </div>
            <div className="rounded-lg border border-fd-border bg-fd-background p-3 text-center">
              Akan datang: {upcomingCount}
            </div>
            <div className="rounded-lg border border-fd-border bg-fd-background p-3 text-center">
              Berakhir: {expiredCount}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/admin/attendance"
          className="inline-flex items-center justify-between gap-3 rounded-xl border border-fd-border bg-fd-card p-4 text-sm font-medium text-fd-foreground transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Lihat Presensi Mahasiswa
          </span>
          <ArrowRight className="h-4 w-4 text-fd-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/admin/attendance/new"
          className="inline-flex items-center justify-between gap-3 rounded-xl bg-fd-primary p-4 text-sm font-semibold text-fd-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Sesi Baru
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-fd-foreground">Sesi Presensi Terbaru</h2>
          <span className="text-xs text-fd-muted-foreground">({sessions.length} sesi)</span>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-fd-border bg-fd-card p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-fd-muted-foreground" />
            <p className="mt-2 text-sm text-fd-muted-foreground">Belum ada sesi presensi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => {
              const isExpired = now > s.endTime;
              const isActive = now >= s.startTime && now <= s.endTime;

              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-fd-border bg-fd-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-fd-foreground">{s.title}</h3>
                      <div className="mt-2 space-y-1 text-sm text-fd-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {formatWIB(s.startTime)} - {formatWIB(s.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>Radius: {s.radius} meter</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 sm:mt-0">
                      {isActive && (
                        <span className="status-chip" data-tone="active">
                          <Clock className="h-3 w-3" />
                          Aktif
                        </span>
                      )}
                      {isExpired && (
                        <span className="status-chip" data-tone="expired">
                          <XCircle className="h-3 w-3" />
                          Berakhir
                        </span>
                      )}
                      {!isActive && !isExpired && (
                        <span className="status-chip" data-tone="upcoming">
                          <Calendar className="h-3 w-3" />
                          Akan datang
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
