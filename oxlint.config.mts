import regexp from 'eslint-plugin-regexp'
import { defineConfig } from 'oxlint'

// Rule-by-rule history of how the old @antfu/eslint-config setup maps onto this
// file: docs/adr/0008-oxlint-replaces-eslint.md. Formatting belongs to oxfmt
// (.oxfmtrc.json); nothing here is about layout.

// Banned in every TypeScript file. `const enum` and `export =` don't survive
// isolatedModules / ESM. The React APIs are ones React 19 removed or
// superseded; matched as syntax because shadcn's `import * as React` would
// trip no-restricted-imports wholesale.
const legacyReact = 'Removed or superseded in React 19: use useRef, a plain ref prop, or use(Context).'
const tsSyntax = [
  'TSEnumDeclaration[const=true]',
  'TSExportAssignment',
  {
    selector:
      "ImportDeclaration[source.value='react'] > ImportSpecifier[imported.name=/^(createRef|forwardRef|useContext)$/]",
    message: legacyReact,
  },
  {
    selector: "MemberExpression[object.name='React'][property.name=/^(createRef|forwardRef|useContext)$/]",
    message: legacyReact,
  },
]

// i18n: user-visible strings live in apps/web/messages/*.json, see
// docs/I18N.md. Bans hardcoded JSX text and translatable string props.
// MediaMTX field labels pass because they render the config key verbatim from a
// variable, never as a literal.
const i18nSyntax = [
  {
    selector: 'JSXText[value=/\\p{L}{2,}/u]',
    message: 'No raw string literals in JSX. Move to messages/*.json and read via useTranslations. See docs/I18N.md.',
  },
  {
    selector: "JSXAttribute[name.name=/^(title|alt)$/][value.type='Literal'][value.value=/\\p{L}{2,}/u]",
    message: 'Translate title/alt props via useTranslations. See docs/I18N.md.',
  },
  {
    selector: "JSXAttribute[name.name='aria-label'][value.type='Literal'][value.value=/\\p{L}{2,}/u]",
    message: 'Translate aria-label via useTranslations. See docs/I18N.md.',
  },
]

// A conditional inside a Playwright test body is almost always a test that
// can't fail: `if (await card.count() > 0) { ...assert... }` is green whether or
// not the feature works, and 19 of these had accumulated because asserting
// against live MediaMTX felt unsafe (ADR 0005).
//
// The fixtures make it safe: globalSetup seeds the recordings, and
// scripts/wait-for-mediamtx.mjs gates the suite on the stream fleet being
// published and ready. If state genuinely varies, the test belongs in the
// component layer where it can be made deterministic.
//
// Scoped to test() bodies: cleanup guards in afterEach (`if (!materialized)
// return`) are legitimate and stay allowed.
const testConditionalMessage =
  'No conditionals in a test body — a guarded assertion passes when the feature is broken. Assert unconditionally against the fixtures, or move the test to the component layer. See docs/TESTING.md.'
const e2eSyntax = [
  {
    selector: "CallExpression[callee.name='test'] > ArrowFunctionExpression IfStatement",
    message: testConditionalMessage,
  },
  {
    selector:
      "CallExpression[callee.object.name='test'][callee.property.name=/^(only|skip|fixme)$/] > ArrowFunctionExpression IfStatement",
    message: testConditionalMessage,
  },
]

// eslint-plugin-regexp's recommended set. It also switches on four core rules
// (no-control-regex and friends), which are already on natively below.
const regexpRules = Object.fromEntries(
  Object.entries(regexp.configs['flat/recommended'].rules).filter(([name]) => name.startsWith('regexp/')),
)

export default defineConfig({
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'node', 'jsdoc', 'react', 'vitest'],
  jsPlugins: [
    // ESLint core rules oxlint doesn't implement natively (no-restricted-syntax).
    { name: 'eslint-js', specifier: 'oxlint-plugin-eslint' },
    'eslint-plugin-regexp',
    '@e18e/eslint-plugin',
    'eslint-plugin-antfu',
    // `node` is oxlint's native plugin; this is eslint-plugin-n for the rules
    // the native one lacks.
    { name: 'n', specifier: 'eslint-plugin-n' },
    'eslint-plugin-perfectionist',
  ],
  categories: {
    correctness: 'error',
  },
  env: {
    browser: true,
    node: true,
    es2026: true,
  },
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'error',
    // Disable comments are `oxlint-disable-*` only, so a stale ESLint comment
    // can't silently suppress something.
    respectEslintDisableDirectives: false,
  },
  ignorePatterns: [
    '**/dist',
    'apps/api/public',
    // standalone demo-capture rig with throwaway scripts
    'demo/**',
  ],
  rules: {
    // Core
    'accessor-pairs': ['error', { enforceForClassMembers: true, setWithoutGet: true }],
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'default-case-last': 'error',
    eqeqeq: ['error', 'smart'],
    'new-cap': ['error', { capIsNew: false, newIsCap: true, properties: true }],
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-caller': 'error',
    'no-case-declarations': 'error',
    'no-cond-assign': ['error', 'always'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    'no-iterator': 'error',
    'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
    'no-lone-blocks': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-proto': 'error',
    'no-prototype-builtins': 'error',
    'no-redeclare': ['error', { builtinGlobals: false }],
    'no-regex-spaces': 'error',
    'no-restricted-globals': [
      'error',
      { name: 'global', message: 'Use `globalThis` instead.' },
      { name: 'self', message: 'Use `globalThis` instead.' },
    ],
    'no-restricted-properties': [
      'error',
      { property: '__proto__', message: 'Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.' },
      { property: '__defineGetter__', message: 'Use `Object.defineProperty` instead.' },
      { property: '__defineSetter__', message: 'Use `Object.defineProperty` instead.' },
      { property: '__lookupGetter__', message: 'Use `Object.getOwnPropertyDescriptor` instead.' },
      { property: '__lookupSetter__', message: 'Use `Object.getOwnPropertyDescriptor` instead.' },
    ],
    'no-self-assign': ['error', { props: true }],
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    // ESLint core rules oxlint has no native port of, run from
    // oxlint-plugin-eslint.
    'eslint-js/no-undef-init': 'error',
    'eslint-js/no-unexpected-multiline': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': ['error', { defaultAssignment: false }],
    'no-unreachable-loop': 'error',
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTaggedTemplates: true, allowTernary: true }],
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
    'no-use-before-define': ['error', { classes: false, functions: false, variables: true }],
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'object-shorthand': ['error', 'always', { avoidQuotes: true, ignoreConstructors: false }],
    'one-var': ['error', { initialized: 'never' }],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
    'prefer-const': ['error', { destructuring: 'all', ignoreReadBeforeAssign: true }],
    'prefer-exponentiation-operator': 'error',
    'prefer-promise-reject-errors': 'error',
    'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'symbol-description': 'error',
    'unicode-bom': ['error', 'never'],
    'use-isnan': ['error', { enforceForIndexOf: true, enforceForSwitchCase: true }],
    'valid-typeof': ['error', { requireStringLiterals: true }],
    'vars-on-top': 'error',
    yoda: ['error', 'never'],

    // Imports and modules
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/first': 'error',
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-duplicates': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-default': 'error',
    'antfu/import-dedupe': 'error',
    'antfu/no-import-dist': 'error',
    'antfu/no-import-node-modules-by-path': 'error',
    'antfu/top-level-function': 'error',
    'node/no-top-level-await': 'error',
    'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
    'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],

    // Node
    'node/handle-callback-err': ['error', '^(err|error)$'],
    'node/no-exports-assign': 'error',
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    'n/no-deprecated-api': 'error',
    'n/prefer-global/buffer': ['error', 'never'],
    'n/prefer-global/process': ['error', 'never'],

    // unicorn
    'unicorn/consistent-empty-array-spread': 'error',
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/new-for-builtins': 'error',
    'unicorn/no-instanceof-builtins': 'error',
    'unicorn/no-new-array': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/number-literal-case': 'error',
    'unicorn/prefer-dom-node-text-content': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/throw-new-error': 'error',
    // Was eslint-comments/no-unlimited-disable: a bare disable comment hides
    // every rule at once.
    'unicorn/no-abusive-eslint-disable': 'error',

    // e18e: modern, faster built-ins over legacy idioms
    'e18e/prefer-array-fill': 'error',
    'e18e/prefer-array-some': 'error',
    'e18e/prefer-date-now': 'error',
    'e18e/prefer-includes': 'error',
    'e18e/prefer-nullish-coalescing': 'error',
    'e18e/prefer-object-has-own': 'error',
    'e18e/prefer-regex-test': 'error',
    'e18e/prefer-string-fromcharcode': 'error',
    'e18e/prefer-timer-args': 'error',
    'e18e/prefer-url-canparse': 'error',

    ...regexpRules,

    // JSDoc (warnings, as before)
    'jsdoc/check-access': 'warn',
    'jsdoc/check-property-names': 'warn',
    'jsdoc/empty-tags': 'warn',
    'jsdoc/implements-on-classes': 'warn',
    'jsdoc/no-defaults': 'warn',
    'jsdoc/require-param-name': 'warn',
    'jsdoc/require-property': 'warn',
    'jsdoc/require-property-description': 'warn',
    'jsdoc/require-property-name': 'warn',
    'jsdoc/require-returns-description': 'warn',

    // React. Was @eslint-react's recommended set; that plugin loads the
    // TypeScript JS API at import time, which TypeScript 7 doesn't ship, so
    // these are the native equivalents (ADR 0008 has the mapping).
    'react/error-boundaries': 'error',
    'react/exhaustive-deps': 'warn',
    'react/hook-use-state': 'warn',
    'react/iframe-missing-sandbox': 'warn',
    'react/jsx-key': ['error', { checkKeyMustBeforeSpread: true }],
    'react/jsx-no-comment-textnodes': 'warn',
    'react/jsx-no-script-url': 'warn',
    'react/no-array-index-key': 'warn',
    'react/no-children-prop': 'error',
    'react/no-clone-element': 'warn',
    'react/no-danger': 'warn',
    'react/no-danger-with-children': 'error',
    'react/no-did-mount-set-state': 'warn',
    'react/no-did-update-set-state': 'warn',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-namespace': 'error',
    'react/no-react-children': 'warn',
    'react/no-render-return-value': 'error',
    'react/no-unsafe': ['error', { checkAliases: true }],
    // allowAsProps: use-intl's t.rich() takes render callbacks for its tags.
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
    'react/no-will-update-set-state': 'warn',
    'react/purity': 'warn',
    'react/rules-of-hooks': 'error',
    'react/set-state-in-effect': 'warn',
    'react/set-state-in-render': 'error',
    'react/static-components': 'error',
    'react/unsupported-syntax': 'error',
    'react/use-memo': 'error',
    'react/void-dom-elements-no-children': 'error',
    // Legacy or performance-hostile react-dom APIs.
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-dom',
            importNames: ['findDOMNode', 'flushSync', 'hydrate', 'render', 'unmountComponentAtNode', 'useFormState'],
            message: 'Legacy or performance-hostile react-dom API; see https://react.dev/reference/react-dom.',
          },
        ],
      },
    ],
    'react/only-export-components': ['error', { allowConstantExport: false }],

    // Opt-outs from oxlint's correctness category, which is on above.
    // Wants `vi.fn<T>()` everywhere; inference already types these mocks.
    'vitest/require-mock-type-parameters': 'off',
    // A bare toThrow() is fine when the test is about *whether* it throws.
    'vitest/require-to-throw-message': 'off',
    // React Compiler bailout notice (react-hook-form's watch()); this app
    // doesn't run the compiler.
    'react/incompatible-library': 'off',
  },
  overrides: [
    {
      files: ['**/*.{ts,mts,cts,tsx}'],
      rules: {
        'typescript/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],
        'typescript/consistent-type-definitions': ['error', 'interface'],
        'typescript/consistent-type-imports': [
          'error',
          {
            disallowTypeAnnotations: false,
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],
        'typescript/method-signature-style': ['error', 'property'],
        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
        'typescript/no-extra-non-null-assertion': 'error',
        'typescript/no-import-type-side-effects': 'error',
        'typescript/no-misused-new': 'error',
        'typescript/no-namespace': 'error',
        'typescript/no-non-null-asserted-nullish-coalescing': 'error',
        'typescript/no-non-null-asserted-optional-chain': 'error',
        'typescript/no-require-imports': 'error',
        'typescript/no-this-alias': 'error',
        'typescript/no-unnecessary-type-constraint': 'error',
        'typescript/no-unsafe-declaration-merging': 'error',
        'typescript/no-unsafe-function-type': 'error',
        'typescript/no-wrapper-object-types': 'error',
        'typescript/prefer-as-const': 'error',
        'typescript/prefer-literal-enum-member': 'error',
        'typescript/prefer-namespace-keyword': 'error',

        // Type-aware (oxlint-tsgolint). New with the move to oxlint: the old
        // ESLint setup never had a tsconfig wired in, so none of these ran.
        'typescript/await-thenable': 'error',
        'typescript/dot-notation': ['error', { allowKeywords: true }],
        'typescript/no-floating-promises': 'error',
        'typescript/no-for-in-array': 'error',
        'typescript/no-implied-eval': 'error',
        // An async onClick/onSubmit is the normal React idiom; the promise is
        // the handler's own business.
        'typescript/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
        'typescript/no-unnecessary-type-assertion': 'error',
        'typescript/only-throw-error': 'error',
        'typescript/restrict-plus-operands': 'error',
        // Flags String(x) on `unknown`, which is how form inputs (z.coerce) and
        // fetch-mock arguments get stringified here on purpose.
        'typescript/no-base-to-string': 'off',

        // console.* is banned outside the loggers (Pino in the api, a console
        // wrapper in the web app).
        'no-console': 'error',
        'eslint-js/no-restricted-syntax': ['error', ...tsSyntax],
      },
    },
    {
      // Plain JS has no compiler to catch these.
      files: ['**/*.{js,mjs,cjs}'],
      rules: {
        'no-undef': ['error', { typeof: false }],
        // TypeScript files get the type-aware versions of these two.
        'eslint-js/dot-notation': ['error', { allowKeywords: true }],
        'eslint-js/no-implied-eval': 'error',
        // ESM and TypeScript are always strict, where these are parse errors;
        // release.config.js is the one sloppy-mode CommonJS file.
        'eslint-js/no-dupe-args': 'error',
        'eslint-js/no-octal': 'error',
        'eslint-js/no-octal-escape': 'error',
      },
    },
    {
      files: ['apps/web/src/lib/logger.ts', 'apps/api/src/logger.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/scripts/**', '**/*.config.*'],
      rules: {
        'node/no-top-level-await': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.{test,spec}.{ts,tsx,mjs}', '**/__tests__/**'],
      rules: {
        'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
        'vitest/no-focused-tests': 'error',
        'vitest/no-identical-title': 'error',
        'vitest/no-import-node-test': 'error',
        'vitest/prefer-hooks-in-order': 'error',
        'vitest/prefer-lowercase-title': 'error',
        'node/no-top-level-await': 'off',
        'no-unused-expressions': 'off',
      },
    },
    {
      // shadcn-generated primitives. They follow shadcn conventions (variant
      // exports, nested component props, etc.). We don't hand-edit these files
      // except for re-export tweaks, so loosen the rules here.
      files: ['apps/web/src/components/ui/**'],
      rules: {
        'react/only-export-components': 'off',
        'react/no-unstable-nested-components': 'off',
        'react/set-state-in-effect': 'off',
        'typescript/no-useless-default-assignment': 'off',
        'typescript/no-unnecessary-type-assertion': 'off',
      },
    },
    {
      // context + provider share a file by design; main.tsx is the entry
      // point, which Fast Refresh never swaps.
      files: ['apps/web/src/i18n/provider.tsx', 'apps/web/src/main.tsx'],
      rules: {
        'react/only-export-components': 'off',
      },
    },
    {
      files: ['apps/web/src/features/**/*.tsx', 'apps/web/src/components/**/*.tsx'],
      rules: {
        'eslint-js/no-restricted-syntax': ['error', ...tsSyntax, ...i18nSyntax],
      },
    },
    {
      // Exempt from the i18n ban: tests, shadcn primitives, and the locale
      // switcher (language names are not translated).
      files: [
        'apps/web/src/**/*.test.tsx',
        'apps/web/src/components/ui/**',
        'apps/web/src/components/locale-switcher.tsx',
      ],
      rules: {
        'eslint-js/no-restricted-syntax': ['error', ...tsSyntax],
      },
    },
    {
      files: ['tests/e2e/**/*.spec.ts'],
      rules: {
        'eslint-js/no-restricted-syntax': ['error', ...tsSyntax, ...e2eSyntax],
      },
    },
  ],
})
