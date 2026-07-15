import { defineConfig, devices } from '@playwright/test'

// Tests that exercise pure HTTP behavior (no UI rendering) only need to run
// once; cross-browser execution doesn't change their outcome.
const uiSpecs = /(?:config|recordings|streams|a11y)\.spec\.ts/

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: uiSpecs },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testMatch: uiSpecs },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testMatch: uiSpecs },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] }, testMatch: uiSpecs },
  ],
  webServer: {
    // Requires a prior `pnpm build` (which also copies the SPA into
    // apps/api/public). Test-shaped defaults below; CI overrides via env.
    command: 'node apps/api/dist/server.mjs',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      DATA_DIR: './test-data/data',
      MEDIAMTX_RECORDINGS_DIR: './test-data/recordings',
      MEDIAMTX_SCREENSHOTS_DIR: './test-data/screenshots',
      BACKEND_SERVER_MEDIAMTX_URL: 'http://127.0.0.1',
      REMOTE_MEDIAMTX_URL: 'http://localhost',
      ...Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined)) as Record<string, string>,
    },
  },
})
