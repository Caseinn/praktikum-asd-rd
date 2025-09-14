'use client'

import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AbsenForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [nim, setNim] = React.useState("")
  const [msg, setMsg] = React.useState<string | null>(null)
  const [statusColor, setStatusColor] = React.useState<"green" | "yellow" | "red" | null>(null)
  const [loading, setLoading] = React.useState(false)

  function handleNimChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D+/g, "")
    setNim(digitsOnly)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    setStatusColor(null)

    const nimClean = nim.trim()
    if (!/^\d{6,15}$/.test(nimClean)) {
      setMsg("Format NIM tidak valid (6–15 digit).")
      setStatusColor("red")
      return
    }

    setLoading(true)
    try {
      const r = await fetch("/api/absen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: nimClean }),
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

      if (data?.ok) setNim("")
    } catch {
      setMsg("Tidak bisa terhubung ke server. Coba lagi.")
      setStatusColor("red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <h1 className="text-xl font-bold">Absensi Praktikum</h1>
            <div className="text-center text-xs text-muted-foreground">
              Tanggal Aktif: {new Date().toISOString().slice(0, 10)}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="nim">NIM</Label>
              <Input
                id="nim"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Contoh: 122140001"
                value={nim}
                onChange={handleNimChange}
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground">
                Hanya angka, 6–15 digit.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white dark:bg-white dark:text-black"
              disabled={loading || nim.length === 0}
            >
              {loading ? "Memproses…" : "Kirim"}
            </Button>

            {msg && (
              <div
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  statusColor === "green" && "border-green-500 bg-green-50 text-green-700",
                  statusColor === "yellow" && "border-yellow-500 bg-yellow-50 text-yellow-700",
                  statusColor === "red" && "border-red-500 bg-red-50 text-red-700"
                )}
                role="status"
                aria-live="polite"
              >
                {msg}
              </div>
            )}
          </div>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Dengan menekan Kirim, Anda menyetujui tata tertib kelas.
      </div>
    </div>
  )
}
