export function createExecutionTimer() {
  const startedAt = performance.now()
  return {
    elapsedMs: () => Math.round(performance.now() - startedAt),
  }
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}
