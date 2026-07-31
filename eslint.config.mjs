import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    react: true,
    markdown: false,
    ignores: [
      '**/dist',
      'apps/api/public',
      // standalone demo-capture rig with throwaway scripts
      'demo/**',
      // agent-harness scaffolding, untracked (see .git/info/exclude) — not our code
      '.smallhours-toolkit/**',
    ],
  },
  {
    // console.* is banned outside the loggers (Pino in the api, a console
    // wrapper in the web app).
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['apps/web/src/lib/logger.ts', 'apps/api/src/logger.ts'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    // shadcn-generated primitives. They follow shadcn conventions which
    // collide with @antfu/eslint-config (variant exports, nested component
    // props, etc.). We don't hand-edit these files except for re-export
    // tweaks, so loosen the rules here.
    files: ['apps/web/src/components/ui/**', 'apps/web/src/hooks/use-mobile.ts'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react/no-nested-component-definitions': 'off',
      'react/set-state-in-effect': 'off',
    },
  },
  {
    // context + provider share a file by design
    files: ['apps/web/src/i18n/provider.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // i18n: user-visible strings live in apps/web/messages/*.json — see
    // docs/I18N.md in the main repo. Bans hardcoded JSX text and translatable
    // string props in feature and shared component code. Excludes shadcn
    // primitives, MediaMTX field labels (intentionally English to mirror
    // MediaMTX docs), and the locale-switcher (language names are not
    // translated).
    files: ['apps/web/src/features/**/*.tsx', 'apps/web/src/components/**/*.tsx'],
    ignores: [
      '**/*.test.tsx',
      'apps/web/src/components/ui/**',
      'apps/web/src/features/mediamtx-config/sections/**',
      'apps/web/src/features/mediamtx-config/form-fields.tsx',
      'apps/web/src/components/locale-switcher.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/\\p{L}{2,}/u]',
          message: 'No raw string literals in JSX. Move to messages/*.json and read via useTranslations. See docs/I18N.md.',
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
  {
    // A conditional inside a Playwright test body is almost always a test that
    // can't fail: `if (await card.count() > 0) { ...assert... }` is green
    // whether or not the feature works, and 19 of these had accumulated because
    // asserting against live MediaMTX felt unsafe (ADR 0005).
    //
    // The fixtures make it safe: globalSetup seeds the recordings, and
    // scripts/wait-for-mediamtx.mjs gates the suite on the stream fleet being
    // published and ready. If state genuinely varies, the test belongs in the
    // component layer where it can be made deterministic.
    //
    // Scoped to test() bodies — cleanup guards in afterEach (`if (!materialized)
    // return`) are legitimate and stay allowed.
    files: ['tests/e2e/**/*.spec.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name=\'test\'] > ArrowFunctionExpression IfStatement',
          message: 'No conditionals in a test body — a guarded assertion passes when the feature is broken. Assert unconditionally against the fixtures, or move the test to the component layer. See docs/TESTING.md.',
        },
        {
          selector: 'CallExpression[callee.object.name=\'test\'][callee.property.name=/^(only|skip|fixme)$/] > ArrowFunctionExpression IfStatement',
          message: 'No conditionals in a test body — a guarded assertion passes when the feature is broken. Assert unconditionally against the fixtures, or move the test to the component layer. See docs/TESTING.md.',
        },
      ],
    },
  },
)
