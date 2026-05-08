import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('joins class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c')
  })

  it('flattens arrays and objects', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c')
  })

  it('resolves Tailwind conflicts via tailwind-merge', () => {
    expect(cn('p-2 p-4')).toBe('p-4')
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })
})
