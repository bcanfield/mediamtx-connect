import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

// Tests that exercise pure HTTP behavior (no UI rendering) only need to run
// once; cross-browser execution doesn't change their outcome.
// Anchored on the path separator: unanchored, this also matched any spec
// *ending* in one of these names (path-config.spec.ts), opting it into five
// browsers that would then race each other writing the same MediaMTX key.
const uiSpecs = /\/(?:config|recordings|streams|a11y)\.spec\.ts/

// The four extra browsers replay the same 44 UI tests, taking the run from 82
// executions to 258. They stay opt-in: the nightly workflow sets this, PRs and
// local runs get chromium only. See docs/adr/0005-fast-test-suite.md.
const allBrowsers = !!process.env.E2E_ALL_BROWSERS

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  // Default is half the logical cores — 2 on a GitHub runner, which left half
  // the machine idle.
  workers: process.env.CI ? '100%' : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ...allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: uiSpecs },
          { name: 'webkit', use: { ...devices['Desktop Safari'] }, testMatch: uiSpecs },
          { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testMatch: uiSpecs },
          { name: 'mobile-safari', use: { ...devices['iPhone 14'] }, testMatch: uiSpecs },
        ]
      : [],
  ],
  webServer: {
    // Requires a prior `pnpm build` (which also copies the SPA into
    // apps/api/public). Test-shaped defaults below; CI overrides via env.
    command: 'node apps/api/dist/server.mjs',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      DATA_DIR: './test-results/e2e-data/data',
      MEDIAMTX_RECORDINGS_DIR: './test-results/e2e-data/recordings',
      MEDIAMTX_SCREENSHOTS_DIR: './test-results/e2e-data/screenshots',
      BACKEND_SERVER_MEDIAMTX_URL: 'http://127.0.0.1',
      REMOTE_MEDIAMTX_URL: 'http://localhost',
      ...Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined)) as Record<string, string>,
    },
  },
})
