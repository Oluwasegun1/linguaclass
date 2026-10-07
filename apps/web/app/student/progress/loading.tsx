export default function ProgressLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="h-4 w-44 rounded-lg bg-surface-2" />
        <div className="h-9 w-72 rounded-xl bg-surface-2" />
        <div className="h-4 w-96 rounded-lg bg-surface-2" />
      </div>

      {/* Skills Radar card skeleton */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 space-y-6">
        {/* Stat pills row */}
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-28 rounded-2xl bg-surface-2" />
          ))}
        </div>
        {/* Radar placeholder */}
        <div className="mx-auto size-64 rounded-full bg-surface-2" />
      </div>

      {/* Two-column grid: corrections + assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Corrections card */}
        <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 space-y-4">
          <div className="h-6 w-40 rounded-lg bg-surface-2" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-2 h-20" />
          ))}
        </div>
        {/* Assignments card */}
        <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 space-y-4">
          <div className="h-6 w-40 rounded-lg bg-surface-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-2 h-14" />
          ))}
        </div>
      </div>
    </main>
  );
}
