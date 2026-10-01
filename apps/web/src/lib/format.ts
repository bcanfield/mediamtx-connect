import type { useFormatter } from 'use-intl'

// Display formatters shared across features.

export function formatUptime(readyTime: string): string {
  const totalMinutes = Math.max(0, Math.floor((Date.now() - new Date(readyTime).getTime()) / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const

// Scales to the largest unit the count fills, so a path that has moved a few
// kilobytes doesn't read "0.0 MB". The unit label comes from Intl, per locale.
export function formatBytes(format: ReturnType<typeof useFormatter>, bytes: number): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit++
  }
  return format.number(value, { style: 'unit', unit: BYTE_UNITS[unit], maximumFractionDigits: 1 })
}
