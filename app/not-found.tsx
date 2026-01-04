import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-md rounded-2xl border border-fd-border bg-fd-card p-6 text-center shadow-sm sm:p-8">
        <p className="text-4xl font-semibold text-fd-foreground sm:text-5xl">404</p>
        <h1 className="mt-3 text-lg font-semibold text-fd-foreground sm:text-xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-fd-muted-foreground">
          Cek kembali alamat yang kamu buka.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-background px-4 py-2 text-sm font-medium text-fd-foreground transition hover:bg-fd-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </div>
    </main>
  );
}
