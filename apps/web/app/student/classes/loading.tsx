export default function ClassesLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Page Header skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-36 rounded-lg bg-surface-2" />
        <div className="h-9 w-56 rounded-xl bg-surface-2" />
        <div className="h-4 w-96 rounded-lg bg-surface-2" />
      </div>

      {/* Course card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-surface border border-border shadow-sm p-5 space-y-4 h-64"
          >
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 rounded-lg bg-surface-2" />
                <div className="h-6 w-48 rounded-lg bg-surface-2" />
              </div>
              <div className="size-10 rounded-xl bg-surface-2 shrink-0" />
            </div>
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-surface-2" />
              <div className="h-3 w-3/4 rounded-full bg-surface-2" />
            </div>
            {/* Footer pills */}
            <div className="flex gap-2 pt-2">
              <div className="h-7 w-20 rounded-full bg-surface-2" />
              <div className="h-7 w-24 rounded-full bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
