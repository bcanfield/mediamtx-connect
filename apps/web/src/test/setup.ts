import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
// Registers the jest-dom matchers AND their type augmentation — importing
// '@testing-library/jest-dom/matchers' and calling expect.extend by hand adds
// the matchers at runtime but leaves tsc not knowing about toBeInTheDocument.
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})
