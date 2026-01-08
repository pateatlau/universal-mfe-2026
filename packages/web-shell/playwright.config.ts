/**
 * Playwright E2E Test Configuration
 *
 * This configuration is designed for testing the web shell with Module Federation
 * remote modules. Tests can run in two modes:
 *
 * 1. Full mode (remote available): Tests remote module loading and interaction
 * 2. Shell-only mode (no remote): Tests routing, theming, and i18n without remote
 *
 * Prerequisites:
 * - yarn workspace @universal/web-shell build (or dev server running)
 * - yarn workspace @universal/web-remote-hello dev (for remote loading tests)
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Port configuration
 */
const WEB_SHELL_PORT = 9001;
const WEB_REMOTE_PORT = 9003;

/**
 * Base URL for tests
 */
const BASE_URL = `http://localhost:${WEB_SHELL_PORT}`;

export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 1 : 0,

  // Use multiple workers for parallelization (50% of CPU cores in CI)
  workers: process.env.CI ? '50%' : undefined,

  // Reporter to use
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: BASE_URL,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'on-first-retry',
  },

  // Configure projects for browsers
  // CI: Only Chromium to reduce execution time (functional validation)
  // Local: Full browser matrix for cross-browser testing
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        // Test against mobile viewports
        {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
      ],

  // Run local dev servers before starting the tests
  // Note: For CI, we build and serve instead of running dev server
  webServer: process.env.CI
    ? [
        // In CI, we expect pre-built apps served statically
        {
          command: 'npx serve dist -l 9001',
          url: `http://localhost:${WEB_SHELL_PORT}`,
          reuseExistingServer: false,
          timeout: 30 * 1000,
        },
      ]
    : [
        // In local dev, start the dev server or reuse existing
        {
          command: 'yarn dev',
          url: `http://localhost:${WEB_SHELL_PORT}`,
          reuseExistingServer: true,
          timeout: 60 * 1000,
        },
      ],

  // Output directory for test artifacts
  outputDir: 'test-results',

  // Global timeout for each test
  timeout: 30 * 1000,

  // Expect timeout
  expect: {
    timeout: 5 * 1000,
  },
});
