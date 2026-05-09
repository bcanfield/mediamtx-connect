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
  {
    // shadcn-generated primitives. They follow shadcn conventions which
    // collide with @antfu/eslint-config (variant exports, nested component
    // props for Calendar's `components` slot, etc.). We don't hand-edit
    // these files except for re-export tweaks, so loosen the rules here.
    files: ['src/components/ui/**', 'src/hooks/use-mobile.ts'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react/no-nested-component-definitions': 'off',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
    },
  },
  {
    // i18n: user-visible strings live in messages/*.json — see docs/I18N.md.
    // Bans hardcoded JSX text and translatable string props (aria-label,
    // title, alt) in feature and shared component code. `placeholder` is
    // intentionally NOT covered — those are commonly literal example values
    // (URLs, paths) that don't translate. Excludes shadcn primitives,
    // MediaMTX field labels (intentionally English to mirror MediaMTX docs),
    // and the locale-switcher (language names are not translated).
    files: ['src/features/**/*.tsx', 'src/components/**/*.tsx'],
    ignores: [
      'src/components/ui/**',
      'src/features/mediamtx-config/sections/**',
      'src/features/mediamtx-config/form-fields.tsx',
      'src/components/locale-switcher.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/\\p{L}{2,}/u]',
          message: 'No raw string literals in JSX. Move to messages/*.json and read via useTranslations/getTranslations. See docs/I18N.md.',
        },
        {
          selector: 'JSXAttribute[name.name=/^(title|alt)$/][value.type=\'Literal\'][value.value=/\\p{L}{2,}/u]',
          message: 'Translate title/alt props via useTranslations. See docs/I18N.md.',
        },
        {
          selector: 'JSXAttribute[name.name=\'aria-label\'][value.type=\'Literal\'][value.value=/\\p{L}{2,}/u]',
          message: 'Translate aria-label via useTranslations. See docs/I18N.md.',
        },
      ],
    },
  },
)
