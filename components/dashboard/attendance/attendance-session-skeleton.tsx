import { Skeleton } from "@/components/ui/skeleton";

type AttendanceSessionSkeletonProps = {
  showAdmin?: boolean;
};

export default function AttendanceSessionSkeleton({
  showAdmin = false,
}: AttendanceSessionSkeletonProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl rounded-lg border border-fd-border bg-fd-card p-5 sm:p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <div className="mt-4 space-y-2 border-t border-fd-border pt-4">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="mt-6 space-y-4">
          {showAdmin ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <div className="grid gap-2 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-full" />
                  ))}
                </div>
                <div className="rounded-md border border-fd-border">
                  <div className="border-b border-fd-border bg-fd-muted p-2">
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Skeleton className="h-10 w-full" />
          )}
        </div>
      </div>
    </main>
  );
}
