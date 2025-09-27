'use client'

import * as React from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  MapPin,
  Clock3,
  CircleUserRound,
  Crosshair,
  LogIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/** ====== CONFIG (edit if needed) ====== */
const CAMPUS = { lat: -5.3603738, lng: 105.3103092 }
const RADIUS_M = 200
const WINDOW = { start: { h: 15, m: 50 }, end: { h: 17, m: 30 } }
/** ===================================== */

function toRad(d: number) { return d * Math.PI / 180 }
function haversine(a: { lat: number, lng: number }, b: { lat: number, lng: number }) {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const la1 = toRad(a.lat)
  const la2 = toRad(b.lat)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}
function fmtMeters(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`
}
function wibNow(): Date {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  const p = fmt.formatToParts(new Date())
  const g = (t: string) => Number(p.find(x => x.type === t)?.value || 0)
  return new Date(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second'))
}
function isWithinWindowWIB(now = wibNow()) {
  const isThu = now.getDay() === 4
  const cur = now.getHours() * 60 + now.getMinutes()
  const start = WINDOW.start.h * 60 + WINDOW.start.m
  const end = WINDOW.end.h * 60 + WINDOW.end.m
  return isThu && cur >= start && cur <= end
}
function wibClockString(d = wibNow()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`
}

async function getCoords(): Promise<{ lat: number, lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    )
  })
}

type StatusColor = 'green' | 'yellow' | 'red' | null

export default function AbsenForm() {
  const [user, setUser] = React.useState<{ email: string; nim: string } | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)
  const [statusColor, setStatusColor] = React.useState<StatusColor>(null)
  const [loading, setLoading] = React.useState(false)

  const [nowStr, setNowStr] = React.useState(wibClockString())
  const [inWindow, setInWindow] = React.useState(isWithinWindowWIB())

  const [coords, setCoords] = React.useState<{ lat: number, lng: number } | null>(null)
  const [distance, setDistance] = React.useState<number | null>(null)
  const [geoAsking, setGeoAsking] = React.useState(false)

  /** Check session on load */
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (!res.ok) return
        const data = await res.json()
        setUser(data.user)
      } catch {
        // silent
      }
    }
    checkSession()
  }, [])

  /** Live WIB clock + window */
  React.useEffect(() => {
    const t = setInterval(() => {
      setNowStr(wibClockString())
      setInWindow(isWithinWindowWIB())
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/api/auth/login')
      if (!res.ok) {
        setMsg('Gagal memulai login Google')
        setStatusColor('red')
        return
      }
      const data = await res.json()
      window.location.href = data.url
    } catch {
      setMsg('Gagal memulai login Google')
      setStatusColor('red')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
      setMsg(null)
      setStatusColor(null)
    }
  }

  async function askLocation() {
    setGeoAsking(true)
    const c = await getCoords()
    setCoords(c)
    if (c) setDistance(haversine(c, CAMPUS))
    setGeoAsking(false)
  }

async function onSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!user) return

  setMsg(null)
  setStatusColor(null)
  setLoading(true)

  try {
    const c = coords ?? await getCoords()
    const res = await fetch("/api/absen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, coords: c }),
    })
    const data = await res.json()

    const pesan = data?.msg || (data?.ok ? "Absen berhasil." : "Gagal mencatat absen.")
    setMsg(pesan)

    if (!data?.ok) {
      setStatusColor("red")
    } else if (data.already) { // ← CHECK THE BOOLEAN FLAG
      setStatusColor("yellow")
    } else {
      setStatusColor("green")
    }

    if (data?.ok && c) {
      setCoords(c)
      setDistance(haversine(c, CAMPUS))
    }
  } catch {
    setMsg("Tidak bisa terhubung ke server. Coba lagi.")
    setStatusColor("red")
  } finally {
    setLoading(false)
  }
}

  const StatusIcon = statusColor === 'green'
    ? CheckCircle2
    : statusColor === 'yellow'
    ? AlertTriangle
    : statusColor === 'red'
    ? XCircle
    : null

  const statusCopy = inWindow ? 'Buka' : 'Tutup'

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
              <CircleUserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">Absensi Praktikum</h1>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="size-3" />
                <span className="truncate" aria-live="polite">{nowStr}</span>
              </div>
            </div>
          </div>

          {/* Window + status */}
          <div
            className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs ${
              inWindow
                ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300'
                : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-1.5">
              <Clock3 className="size-3.5" />
              <span>
                Kamis {String(WINDOW.start.h).padStart(2, '0')}:
                {String(WINDOW.start.m).padStart(2, '0')}–{String(WINDOW.end.h).padStart(2, '0')}:
                {String(WINDOW.end.m).padStart(2, '0')}
              </span>
            </div>
            <Badge
              variant="secondary"
              className={`px-1.5 py-0.5 text-xs ${inWindow ? 'border-green-500 text-green-700 dark:text-green-300' : 'border-amber-500 text-amber-700 dark:text-amber-300'}`}
            >
              <span className={`mr-1 inline-block size-1.5 rounded-full ${inWindow ? 'bg-green-600' : 'bg-amber-600'}`} />
              {statusCopy}
            </Badge>
          </div>

          {/* Auth */}
          {!user ? (
            <Button onClick={handleGoogleLogin} className="w-full gap-1.5 py-2" aria-label="Login dengan Google" disabled={!inWindow}>
              <LogIn className="size-3.5" />
              <span className="text-sm">Login dengan Google</span>
            </Button>
          ) : (
            <div className="rounded-md border bg-muted/30 p-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium">Terdaftar sebagai</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="h-auto px-1.5 py-0.5 text-[10px]">
                  Keluar
                </Button>
              </div>
              <p className="mt-0.5 truncate">{user.email}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">NIM: {user.nim}</p>
            </div>
          )}

          {/* Location */}
          <div className="rounded-md border">
            <div className="flex items-center justify-between px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {coords && typeof distance === 'number' ? (
                  <span className="truncate">
                    Jarak: <b className="text-foreground">{fmtMeters(distance)}</b>{' '}
                    {distance <= RADIUS_M ? '(✓ dalam radius)' : '(✗ luar radius)'}
                  </span>
                ) : (
                  <span className="truncate">Lokasi belum diambil</span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={askLocation}
                disabled={geoAsking}
                className="gap-1 h-7 px-2 text-xs"
                aria-live="polite"
              >
                {geoAsking ? <Loader2 className="size-3 animate-spin" /> : <Crosshair className="size-3" />}
                Lokasi
              </Button>
            </div>
          </div>

          {/* Submit */}
          {user && (
            <form onSubmit={onSubmit}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-1.5 py-2 text-sm bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
                aria-live="polite"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {loading ? 'Memproses…' : 'Kirim Absen'}
              </Button>
            </form>
          )}

          {/* Message */}
          {msg && (
            <div
              className={`flex items-start gap-1.5 rounded-md border px-2.5 py-2 text-xs ${
                statusColor === 'green'
                  ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300'
                  : statusColor === 'yellow'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:border-yellow-700/40 dark:bg-yellow-900/20 dark:text-yellow-300'
                  : statusColor === 'red'
                  ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300'
                  : ''
              }`}
              role="status"
              aria-live="polite"
            >
              {StatusIcon ? <StatusIcon className="mt-0.5 size-3.5 shrink-0" /> : null}
              <span className="whitespace-pre-wrap">{msg}</span>
            </div>
          )}

          <p className="text-center text-[10px] text-muted-foreground">
            Hanya mahasiswa dengan NIM terdaftar yang dapat absen.
          </p>
        </div>
      </Card>
    </div>
  )
}