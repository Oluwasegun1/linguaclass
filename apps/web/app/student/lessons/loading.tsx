export default function LessonsLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-44 rounded-lg bg-surface-2" />
          <div className="h-9 w-32 rounded-xl bg-surface-2" />
          <div className="h-4 w-80 rounded-lg bg-surface-2" />
        </div>
        {/* Timezone pill */}
        <div className="h-10 w-52 rounded-xl bg-surface border border-border" />
      </div>

      {/* Toggle buttons */}
      <div className="flex gap-3">
        <div className="h-10 w-40 rounded-xl bg-surface-2" />
        <div className="h-10 w-40 rounded-xl bg-surface-2" />
      </div>

      {/* Lesson rows */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex items-center gap-5"
          >
            <div className="size-12 rounded-xl bg-surface-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-64 rounded-lg bg-surface-2" />
              <div className="h-3.5 w-40 rounded-lg bg-surface-2" />
            </div>
            <div className="hidden sm:flex gap-2 shrink-0">
              <div className="h-7 w-20 rounded-full bg-surface-2" />
              <div className="h-7 w-24 rounded-full bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
