"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { MapPin, Clock, CalendarPlus, Info } from "lucide-react";
import { toast } from "sonner";
import { formatWIBInputValue } from "@/lib/time";
import { ensureCsrfToken } from "@/lib/csrf-client";
import { CSRF_HEADER_NAME } from "@/lib/csrf";
import { SESSION_CREATED_TOAST_KEY } from "@/lib/toast-keys";

type FormState = {
  title: string;
  startTime: string;
  latitude: string;
  longitude: string;
  radius: string;
};

function defaultWIBDateTime(hoursFromNow = 0): string {
  const future = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  return formatWIBInputValue(future);
}

export default function CreateSessionForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    title: "",
    startTime: defaultWIBDateTime(0),
    latitude: "",
    longitude: "",
    radius: "50",
  });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (geoError) setGeoError(null);
  };

  const getCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Browser ini tidak mendukung geolokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
      },
      (error) => {
        let message = "Gagal mengambil lokasi.";
        if (error.code === 1) {
          message = "Izinkan akses lokasi di browser untuk menggunakan fitur ini.";
        }
        setGeoError(message);
      }
    );
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeoError(null);

    if (!form.title.trim()) {
      toast.error("Judul sesi wajib diisi.");
      return;
    }
    if (!form.startTime) {
      toast.error("Waktu mulai wajib diisi.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error("Koordinat lokasi wajib diisi.");
      return;
    }
    const radiusNum = Number(form.radius);
    if (isNaN(radiusNum) || radiusNum <= 0) {
      toast.error("Radius harus berupa angka positif.");
      return;
    }

    setBusy(true);
    const toastId = toast.loading("Menyimpan sesi presensi...");
    try {
      const csrfToken = await ensureCsrfToken();
      if (!csrfToken) {
        toast.error("Gagal mendapatkan token keamanan.", { id: toastId });
        return;
      }
      const res = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [CSRF_HEADER_NAME]: csrfToken ?? "",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          startTime: form.startTime, // ini dalam format WIB (string ISO)
          latitude: form.latitude,
          longitude: form.longitude,
          radius: radiusNum,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal membuat sesi.", { id: toastId });
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_CREATED_TOAST_KEY, "Sesi presensi berhasil dibuat!");
      }
      toast.dismiss(toastId);
      setForm((prev) => ({
        ...prev,
        title: "",
        startTime: defaultWIBDateTime(0),
        latitude: "",
        longitude: "",
      }));
      router.push("/dashboard/admin/attendance");
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.", { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-fd-foreground">Buat Sesi Presensi Baru</h1>
          <span className="status-chip">+1 jam WIB</span>
        </div>
        <p className="text-sm text-fd-muted-foreground">
          Waktu berakhir otomatis 1 jam setelah waktu mulai (WIB).
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Judul */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-fd-foreground">
            <CalendarPlus className="h-4 w-4" />
            Judul Sesi
          </label>
          <input
            className="mt-1.5 w-full rounded-md border border-fd-border bg-fd-background p-2.5 text-fd-foreground placeholder:text-fd-muted-foreground"
            value={form.title}
            onChange={update("title")}
            placeholder="Contoh: Minggu 3"
            required
          />
        </div>

        {/* Hanya Waktu Mulai (WIB) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-fd-foreground">
            <Clock className="h-4 w-4" />
            Waktu Mulai (WIB)
          </label>
          <input
            type="datetime-local"
            className="mt-1.5 w-full rounded-md border border-fd-border bg-fd-background p-2.5 text-fd-foreground"
            value={form.startTime}
            onChange={update("startTime")}
            required
          />
          <p className="mt-1 text-xs text-fd-muted-foreground">
            Waktu berakhir otomatis diatur 1 jam setelah ini.
          </p>
        </div>

        {/* Lokasi */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-fd-foreground">
              <MapPin className="h-4 w-4" />
              Latitude
            </label>
            <input
              className="mt-1.5 w-full rounded-md border border-fd-border bg-fd-background p-2.5 text-fd-foreground placeholder:text-fd-muted-foreground"
              value={form.latitude}
              onChange={update("latitude")}
              placeholder="-5.3852"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-fd-foreground">
              <MapPin className="h-4 w-4" />
              Longitude
            </label>
            <input
              className="mt-1.5 w-full rounded-md border border-fd-border bg-fd-background p-2.5 text-fd-foreground placeholder:text-fd-muted-foreground"
              value={form.longitude}
              onChange={update("longitude")}
              placeholder="105.2714"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-fd-foreground">
              <MapPin className="h-4 w-4" />
              Radius (meter)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              className="mt-1.5 w-full rounded-md border border-fd-border bg-fd-background p-2.5 text-fd-foreground"
              value={form.radius}
              onChange={update("radius")}
              required
            />
          </div>
        </div>

        <div className="rounded-lg border border-fd-border bg-fd-background p-4 text-sm">
          <div className="flex items-start gap-2 text-fd-foreground">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-fd-muted-foreground" />
            <span>
              <strong>Pastikan koordinat akurat!</strong> Gunakan tombol di bawah untuk ambil lokasi otomatis.
            </span>
          </div>
        </div>

        {/* Tombol Ambil Lokasi */}
        <div className="pt-1">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={busy}
            className="text-sm font-medium text-fd-foreground underline decoration-fd-border underline-offset-4 hover:no-underline focus:outline-none"
          >
            Ambil lokasi saat ini
          </button>
          {geoError && (
            <p className="mt-1 text-sm text-[color:var(--color-fd-error)]">{geoError}</p>
          )}
        </div>

        {/* Aksi */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard/admin"
            className="text-sm text-fd-muted-foreground hover:underline"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-fd-primary px-4 py-2.5 text-sm font-semibold text-fd-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Menyimpan..." : "Buat Sesi Presensi"}
          </button>
        </div>

      </form>
    </div>
  );
}

