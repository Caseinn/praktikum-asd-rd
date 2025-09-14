import { AbsenForm } from "@/components/absen-form"

export default function AbsenPage() {
  return (
    <div className="bg-background min-h-svh">
      <main className="mx-auto flex min-h-svh max-w-screen-lg items-center justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 md:px-8 md:pt-10">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-xl">
          <AbsenForm />
        </div>
      </main>
    </div>
  )
}
