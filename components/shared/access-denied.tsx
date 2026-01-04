import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

type AccessDeniedProps = {
  backHref?: string;
  backLabel?: string;
};

export default function AccessDenied({
  backHref = "/",
  backLabel = "Kembali",
}: AccessDeniedProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-md rounded-2xl border border-fd-border bg-fd-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fd-muted text-fd-foreground">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-fd-foreground sm:text-xl">
          Akses ditolak
        </h1>
        <p className="mt-2 text-sm text-fd-muted-foreground">
          Anda tidak memiliki izin.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-background px-4 py-2 text-sm font-medium text-fd-foreground transition hover:bg-fd-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
