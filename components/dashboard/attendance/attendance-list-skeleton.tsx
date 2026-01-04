import { Skeleton } from "@/components/ui/skeleton";

type AttendanceListSkeletonProps = {
  showAction?: boolean;
};

export default function AttendanceListSkeleton({
  showAction = false,
}: AttendanceListSkeletonProps) {
  return (
    <main className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-72" />
        </div>
        {showAction && <Skeleton className="h-8 w-24 rounded-md" />}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-fd-border bg-fd-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
