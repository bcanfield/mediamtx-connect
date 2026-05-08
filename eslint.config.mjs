import antfu from '@antfu/eslint-config'

export default antfu(
  {
    nextjs: true,
    typescript: true,
    react: true,
    markdown: false,
    rules: {
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
    },
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/lib/mediamtx/generated.ts',
      'src/lib/prisma/migrations/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['src/lib/logger.ts', 'src/lib/env.ts'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: [
      'src/lib/env.ts',
      'src/lib/logger.ts',
    ],
    rules: {
      'node/prefer-global/process': 'error',
    },
  },
  {
    files: ['public/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
)
