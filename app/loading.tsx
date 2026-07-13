export default function Loading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--color-background)] animate-pulse">
      <div className="border-b border-[var(--color-border)] px-6 py-4">
        <div className="h-5 w-48 rounded bg-[var(--color-surface-3)] mb-2" />
        <div className="h-3 w-72 rounded bg-[var(--color-surface-2)]" />
      </div>
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="h-24 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]" />
        ))}
      </div>
      <div className="px-6 space-y-2">
        {[...Array(6)].map((_,i) => (
          <div key={i} className="h-14 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]" />
        ))}
      </div>
    </div>
  )
}