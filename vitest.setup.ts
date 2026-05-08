import path from 'node:path'

import '@testing-library/jest-dom/vitest'

process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), 'prisma-test.db')}`

if (typeof window !== 'undefined') {
  // Radix primitives need these in jsdom
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  }
  Element.prototype.scrollIntoView ??= () => {}
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.releasePointerCapture ??= () => {}
}
