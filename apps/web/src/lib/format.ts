// Display formatters shared across features. Anything locale-dependent goes
// through `useFormatter()` instead — these two are unit suffixes, not language.

export function formatUptime(readyTime: string): string {
  const totalMinutes = Math.max(0, Math.floor((Date.now() - new Date(readyTime).getTime()) / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3)
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}
