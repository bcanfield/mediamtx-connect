import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const alias = { '@': path.resolve(srcDir) }

// Two projects rather than one environment for everything (ADR 0005, change 1).
// The `logic` suites (whep, playback, publish) need no DOM and pay nothing for
// one; the `component` suites render React and do. Splitting keeps `pnpm verify`
// from making every test pay for the slowest environment.
//
// No tailwind plugin here on purpose: these tests assert behaviour and
// accessible output, never computed styles, so processing the stylesheet would
// be startup cost for nothing.
export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'logic',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'component',
          environment: 'happy-dom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
  },
})
