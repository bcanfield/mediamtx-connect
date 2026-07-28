import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('treats the Geist ramp sizes as font sizes, not colours', () => {
    // Label ships `text-sm`, FormLabel overrides it with `text-control`. If
    // tailwind-merge does not know the ramp, both survive and the winner is
    // decided by stylesheet order.
    expect(cn('text-sm font-medium', 'text-control')).toBe('font-medium text-control')
    expect(cn('text-lead', 'text-section')).toBe('text-section')
  })

  it('keeps a ramp size and a text colour together', () => {
    expect(cn('text-meta text-mute')).toBe('text-meta text-mute')
  })

  it('merges the heading tracking token', () => {
    expect(cn('tracking-widest', 'tracking-title')).toBe('tracking-title')
  })
})
