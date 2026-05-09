interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className = "", lines = 3 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-shimmer h-3 rounded ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ${className}`}
      aria-hidden="true"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="skeleton-shimmer h-4 w-4 rounded" />
        <div className="skeleton-shimmer h-3 w-24 rounded" />
      </div>
      <div className="space-y-3">
        <div className="skeleton-shimmer h-8 w-1/2 rounded" />
        <div className="skeleton-shimmer h-3 w-full rounded" />
        <div className="skeleton-shimmer h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}
