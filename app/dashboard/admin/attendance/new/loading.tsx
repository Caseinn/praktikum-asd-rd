import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-52" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-fd-border bg-fd-background p-4">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="mt-2 h-4 w-52" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>
      </div>
    </main>
  );
}
