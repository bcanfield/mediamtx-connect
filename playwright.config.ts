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
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
