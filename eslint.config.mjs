import antfu from '@antfu/eslint-config'

export default antfu(
  {
    // Enable built-in Next.js support (requires @next/eslint-plugin-next)
    nextjs: true,
    typescript: true,
    react: true,
    // Disable markdown linting to avoid parsing errors with template code blocks
    markdown: false,
    // Global rule overrides
    rules: {
      // Allow Buffer global - common in Node.js code
      'node/prefer-global/buffer': 'off',
      // Default off, will be enabled for src files below
      'node/prefer-global/process': 'off',
    },
    ignores: [
      // Build outputs
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      // Auto-generated files
      'src/lib/MediaMTX/generated.ts',
      'src/lib/prisma/migrations/**',
      // Documentation files
      '**/*.md',
    ],
  },
  {
    // Disallow console.* usage except in logger.ts and env.ts
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['src/app/utils/logger.ts', 'src/env.ts'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    // Enforce process.env centralization in src files only
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: [
      'src/env.ts',
      'src/app/utils/logger.ts',
    ],
    rules: {
      'node/prefer-global/process': 'error',
    },
  },
  {
    // Allow console in public JS files (service worker, etc.)
    files: ['public/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
)
