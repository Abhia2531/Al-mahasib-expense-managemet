/**
 * Loading skeletons. Each mirrors the shape of the real screen so navigation
 * feels instant — you see the layout immediately, then it fills in.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`skeleton block ${className}`} aria-hidden="true" />;
}

/* ---- home ------------------------------------------------------- */

export function HomeSkeleton() {
  return (
    <div
      className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 sm:py-9"
      role="status"
      aria-label="Loading projects"
    >
      <Skeleton className="mb-6 h-[168px] w-full rounded-lg" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-full max-w-sm rounded-md" />
        <Skeleton className="h-4 w-20 rounded-sm" />
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-44 rounded-sm" />
              <Skeleton className="h-3 w-64 rounded-sm" />
            </div>
            <Skeleton className="hidden h-8 w-56 rounded-sm sm:block" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- project shell (header + tabs) --------------------------- */

export function ProjectHeaderSkeleton() {
  return (
    <div className="border-b border-border bg-surface" data-noprint>
      <div className="mx-auto max-w-[1100px] px-4 pt-4 sm:px-6">
        <Skeleton className="h-3.5 w-20 rounded-sm" />
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56 rounded-sm" />
            <Skeleton className="h-3.5 w-72 rounded-sm" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
        <div className="mt-4 flex gap-6 border-b border-border pb-2 pt-1">
          {["w-20", "w-24", "w-16", "w-14", "w-14"].map((w, i) => (
            <Skeleton key={i} className={`h-4 rounded-sm ${w}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FiguresSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 bg-surface px-4 py-4">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="h-6 w-28 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-4 py-3.5">
          <Skeleton className="h-4 w-40 rounded-sm" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

/**
 * Fills the panel under the project shell. No outer container — the project
 * layout provides it; `[id]/loading.tsx` (which renders before the layout)
 * adds its own.
 */
export function SectionSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 rounded-sm" />
        <FiguresSkeleton />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <ListSkeleton />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div
      className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10"
      role="status"
      aria-label="Loading form"
    >
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3.5 w-24 rounded-sm" />
        <Skeleton className="h-7 w-48 rounded-sm" />
      </div>
      <div className="space-y-5 rounded-lg border border-border bg-surface p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-28 rounded-sm" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>
  );
}
