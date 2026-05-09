import { Skeleton, SkeletonCard } from "@/components/shared/Skeleton";

export function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-tadeo-paper">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Hero skeleton */}
          <div className="rounded-2xl bg-gradient-to-br from-tadeo-blue to-tadeo-blueDark p-6 md:col-span-2 lg:col-span-3">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4 sm:flex-1">
                <Skeleton className="hidden h-20 w-20 shrink-0 !rounded-lg sm:block !bg-white/10" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-40 !bg-white/10" />
                  <Skeleton className="h-8 w-full max-w-md !bg-white/10" />
                  <Skeleton className="h-8 w-3/4 max-w-sm !bg-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
                    <Skeleton className="mb-2 h-3 w-16 !bg-white/15" />
                    <Skeleton className="h-7 w-12 !bg-white/15" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System health skeleton */}
          <SkeletonCard className="md:col-span-1" />

          {/* Report summary skeleton */}
          <SkeletonCard className="md:col-span-1 lg:col-span-2" />

          {/* Zone activity skeleton */}
          <SkeletonCard className="md:col-span-1 lg:col-span-2" />

          {/* Live detections skeleton */}
          <SkeletonCard className="md:col-span-1 lg:col-span-2" />

          {/* Quick links skeleton */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:col-span-1 lg:col-span-2">
            <Skeleton className="mb-4 h-3 w-24" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <Skeleton className="mb-3 h-9 w-9 !rounded-full" />
                  <Skeleton className="mb-1 h-4 w-20" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
