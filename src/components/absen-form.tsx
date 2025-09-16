'use client'

import * as React from "react"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  MapPin,
  Clock3,
  CircleUserRound,
  Crosshair,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ================== KONFIG FRONTEND (untuk preview UX saja) ==================
const CAMPUS = { lat: -5.3603738, lng: 105.3103092 } // Gedung Labtek 1 ITERA
const RADIUS_M = 200
// Kamis 16:00–17:30 WIB
const WINDOW = { day: 4 as 0|1|2|3|4|5|6, start: {h:16, m:0}, end:{h:17, m:30} }

// ================== UTIL ==================
async function sha256Hex(s: string) {
  const enc = new TextEncoder().encode(s)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}
async function getDeviceId() {
  const fpRaw = [
    navigator.userAgent,
    navigator.platform,
    screen?.width, screen?.height, screen?.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  ].join('|')
  return await sha256Hex(fpRaw)
}
function toRad(d: number){ return d * Math.PI/180 }
function haversine(a:{lat:number,lng:number}, b:{lat:number,lng:number}) {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const la1  = toRad(a.lat)
  const la2  = toRad(b.lat)
  const x = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2
  return 2*R*Math.asin(Math.sqrt(x))
}
function fmtMeters(m:number){
  return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(2)} km`
}
function wibNow(): Date {
  // Buat “now” di Asia/Jakarta agar indikator window konsisten
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', hour12:false,
    year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'
  })
  const p = fmt.formatToParts(new Date())
  const g = (t:string)=> Number(p.find(x=>x.type===t)?.value || 0)
  return new Date(g('year'), g('month')-1, g('day'), g('hour'), g('minute'), g('second'))
}
function isWithinWindowWIB(now = wibNow()){
  const dow = (now.getDay()+6)%7 // remap: Mon=0 ... Sun=6; Kamis=3 → kita butuh 4
  const isThu = ((now.getDay())===4) // langsung pakai getDay() (0=Sun..6=Sat)
  const cur = now.getHours()*60 + now.getMinutes()
  const start = WINDOW.start.h*60 + WINDOW.start.m
  const end   = WINDOW.end.h*60 + WINDOW.end.m
  return isThu && cur>=start && cur<=end
}
function wibClockString(d=wibNow()){
  const pad = (n:number)=> String(n).padStart(2,'0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`
}

// ================== GEO (browser) ==================
async function getCoords(): Promise<{lat:number,lng:number}|null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    )
  })
}

// ================== KOMPONEN ==================
type StatusColor = "green" | "yellow" | "red" | null

export function AbsenForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [nim, setNim] = React.useState("")
  const [msg, setMsg] = React.useState<string | null>(null)
  const [statusColor, setStatusColor] = React.useState<StatusColor>(null)
  const [loading, setLoading] = React.useState(false)

  const [nowStr, setNowStr] = React.useState(wibClockString())
  const [inWindow, setInWindow] = React.useState(isWithinWindowWIB())
  React.useEffect(()=>{
    const t = setInterval(()=>{
      setNowStr(wibClockString())
      setInWindow(isWithinWindowWIB())
    }, 1000)
    return ()=> clearInterval(t)
  }, [])

  // Preview lokasi
  const [coords, setCoords] = React.useState<{lat:number,lng:number}|null>(null)
  const [distance, setDistance] = React.useState<number | null>(null)
  const [geoAsking, setGeoAsking] = React.useState(false)
  async function askLocation() {
    setGeoAsking(true)
    const c = await getCoords()
    setCoords(c)
    if (c) setDistance(haversine(c, CAMPUS))
    setGeoAsking(false)
  }

  function handleNimChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D+/g, "").slice(0, 9)
    setNim(digitsOnly)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    setStatusColor(null)

    const nimClean = nim.trim()
    if (!/^\d{9}$/.test(nimClean)) {
      setMsg("Format NIM harus 9 digit.")
      setStatusColor("red")
      return
    }

    setLoading(true)
    try {
      const deviceId = await getDeviceId()
      // pakai coords yang sudah diminta; kalau belum, coba sekali minta
      const c = coords ?? await getCoords()

      const r = await fetch("/api/absen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: nimClean, deviceId, coords: c }),
      })
      const data = await r.json()

      const pesan = data?.msg || (data?.ok ? "Absen berhasil." : "Gagal mencatat absen.")
      setMsg(pesan)

      if (!data?.ok) {
        setStatusColor("red")
      } else if (pesan.toLowerCase().includes("sudah absen")) {
        setStatusColor("yellow")
      } else {
        setStatusColor("green")
      }

      if (data?.ok) {
        setNim("")
        // refresh preview jarak (optional)
        if (c) {
          setCoords(c)
          setDistance(haversine(c, CAMPUS))
        }
      }
    } catch {
      setMsg("Tidak bisa terhubung ke server. Coba lagi.")
      setStatusColor("red")
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = statusColor === "green"
    ? CheckCircle2
    : statusColor === "yellow"
    ? AlertTriangle
    : statusColor === "red"
    ? XCircle
    : null

  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border">
            <CircleUserRound className="size-7" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">Absensi Praktikum</h1>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              <span className="truncate">{nowStr}</span>
            </div>
          </div>
        </div>

        {/* Info jadwal & geofence preview */}
        <div className="mb-4 grid gap-2 text-xs">
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
              inWindow
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-amber-300 bg-amber-50 text-amber-700"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock3 className="size-4" />
              <span>
                Kamis{" "}
                {String(WINDOW.start.h).padStart(2,"0")}:
                {String(WINDOW.start.m).padStart(2,"0")}
                —
                {String(WINDOW.end.h).padStart(2,"0")}:
                {String(WINDOW.end.m).padStart(2,"0")}
              </span>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                inWindow ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  inWindow ? "bg-green-600" : "bg-amber-600"
                )}
              />
              {inWindow ? "Buka" : "Tutup"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              {coords && typeof distance === "number" ? (
                <span>
                  Jarak ke kampus: <b className="text-foreground">{fmtMeters(distance)}</b> {distance <= RADIUS_M ? "(di dalam radius)" : "(di luar radius)"}
                </span>
              ) : (
                <span>Lokasi belum diambil</span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={askLocation}
              disabled={geoAsking}
              className="gap-1.5"
            >
              {geoAsking ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
              Lokasi
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nim">NIM</Label>
            <Input
              id="nim"
              inputMode="numeric"
              pattern="[0-9]{9}"
              maxLength={9}
              placeholder="Contoh: 122140001"
              value={nim}
              onChange={handleNimChange}
              autoFocus
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-2 bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
            disabled={loading || nim.length !== 9}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Memproses…" : "Kirim"}
          </Button>
        </form>

        {/* Status */}
        {msg && (
          <div
            className={cn(
              "mt-4 flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
              statusColor === "green" && "border-green-500 bg-green-50 text-green-700",
              statusColor === "yellow" && "border-yellow-500 bg-yellow-50 text-yellow-700",
              statusColor === "red" && "border-red-500 bg-red-50 text-red-700"
            )}
            role="status"
            aria-live="polite"
          >
            {StatusIcon ? <StatusIcon className="mt-0.5 size-4 shrink-0" /> : null}
            <span className="whitespace-pre-wrap">{msg}</span>
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-[11px] text-muted-foreground">
        Dengan menekan Kirim, Anda menyetujui tata tertib kelas.
      </div>
    </div>
  )
}
