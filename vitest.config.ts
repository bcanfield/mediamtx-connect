import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/lib/**/*.ts',
        'src/features/**/*.{schemas,queries,actions}.ts',
      ],
      exclude: [
        'src/lib/mediamtx/generated.ts',
        'src/lib/prisma/**',
        '**/*.test.{ts,tsx}',
      ],
      thresholds: {
        // Per-glob thresholds: only files we've actually tested are gated.
        // Add globs here as each layer's tests land (see docs/TESTING.md).
        'src/lib/utils.ts': { lines: 80, functions: 80, branches: 80, statements: 80 },
        'src/lib/env.ts': { lines: 80, functions: 80, branches: 75, statements: 80 },
        'src/features/**/*.schemas.ts': { lines: 80, functions: 80, branches: 80, statements: 80 },
        'src/features/recordings/file-operations.ts': { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
  },
})
