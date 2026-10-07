export default function DashboardLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* SECTION 1: Next Lesson Banner skeleton */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm h-36" />

      {/* SECTION 2: Pending Assignments skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-48 rounded-lg bg-surface-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-surface border border-border h-28" />
          <div className="rounded-2xl bg-surface border border-border h-28" />
        </div>
      </div>

      {/* SECTION 3: Continue Reviewing skeleton */}
      <div className="rounded-2xl bg-surface border border-border h-40" />

      {/* SECTION 4: Vocab Quick Review skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-40 rounded-lg bg-surface-2" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface border border-border h-24" />
          ))}
        </div>
      </div>

      {/* SECTION 5: Recent Feedback skeleton */}
      <div className="rounded-2xl bg-surface border border-border h-32" />
    </main>
  );
}
