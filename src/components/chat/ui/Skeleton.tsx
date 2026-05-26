"use client";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-input-border/40 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SidebarSkeleton() {
  return (
    <div className="px-3 py-1 space-y-2" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-2.5 py-2">
          <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
          <Skeleton
            className="h-3.5 rounded flex-1"
            style={{ maxWidth: `${60 + Math.random() * 30}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div
      className="flex justify-start gap-3 animate-fade-in"
      aria-hidden="true"
    >
      <div className="shrink-0 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mt-0.5">
        <Skeleton className="w-3.5 h-3.5 rounded" />
      </div>
      <div className="max-w-[80%] space-y-2 py-1">
        <Skeleton className="h-3.5 rounded w-64" />
        <Skeleton className="h-3.5 rounded w-48" />
        <Skeleton className="h-3.5 rounded w-56" />
      </div>
    </div>
  );
}

export function ModelCardSkeleton() {
  return (
    <div
      className="bg-surface border border-border rounded-xl p-4 space-y-3"
      aria-hidden="true"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}
