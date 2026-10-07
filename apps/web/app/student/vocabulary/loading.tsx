export default function VocabularyLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-4 w-36 rounded-lg bg-surface-2" />
        <div className="h-9 w-64 rounded-xl bg-surface-2" />
        <div className="h-4 w-96 rounded-lg bg-surface-2" />
      </div>

      {/* Filter / controls bar */}
      <div className="flex flex-wrap gap-3">
        <div className="h-9 w-28 rounded-xl bg-surface-2" />
        <div className="h-9 w-28 rounded-xl bg-surface-2" />
        <div className="h-9 w-28 rounded-xl bg-surface-2" />
      </div>

      {/* Flashcard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-surface border border-border shadow-sm p-5 space-y-3 h-44"
          >
            <div className="flex items-start justify-between">
              <div className="h-6 w-40 rounded-lg bg-surface-2" />
              <div className="size-7 rounded-lg bg-surface-2" />
            </div>
            <div className="h-4 w-32 rounded-lg bg-surface-2" />
            <div className="h-3.5 w-full rounded-lg bg-surface-2" />
            <div className="h-3.5 w-3/4 rounded-lg bg-surface-2" />
          </div>
        ))}
      </div>
    </main>
  );
}
