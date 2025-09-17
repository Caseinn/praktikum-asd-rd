'use client'

import { AbsenForm } from "@/components/absen-form"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function AbsenPage() {
  const { resolvedTheme } = useTheme()
  const [now, setNow] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const day = now.getDay()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  const isWithinTime = () => {
    if (day !== 4) return false
    const totalMinutes = hours * 60 + minutes
    const start = 15 * 60 + 50
    const end = 17 * 60 + 30
    return totalMinutes >= start && totalMinutes <= end
  }

  const showForm = isWithinTime()

  // FIX: pakai resolvedTheme + mounted guard
  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/unauth-dark.png"
      : "/unauth-light.png"

  return (
    <div className="min-h-svh flex items-center justify-center px-4">
      {showForm ? (
        <div className="w-full max-w-xl rounded-2xl shadow-lg p-6">
          <AbsenForm />
        </div>
      ) : (
        <div className="flex flex-col items-center text-center space-y-6">
          {/* 401 Code */}
          <h1 className="text-8xl md:text-9xl font-extrabold tracking-tighter text-black dark:text-white drop-shadow-lg">
            401
          </h1>

          {/* Illustration */}
          <div className="relative w-40 h-40 md:w-56 md:h-56">
            {mounted && (
              <Image
                src={logoSrc}
                alt="Unauthorized"
                fill
                className="object-contain"
                priority
              />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">
              <span className="text-black dark:text-white">Eitsss… </span>
              <span className="text-destructive">gak bisa masuk broo</span>
            </h2>
            <p className="text-black/80 dark:text-white/80 text-sm md:text-base">
              Absensi hanya tersedia setiap{" "}
              <span className="font-semibold">Kamis</span>,{" "}
              <span className="font-semibold">16.00 – 17.30</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
