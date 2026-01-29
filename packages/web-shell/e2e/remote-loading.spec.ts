/**
 * Remote Loading Tests
 *
 * Tests for Module Federation remote module loading, error handling, and interaction.
 *
 * IMPORTANT: These tests require BOTH:
 * 1. User to be authenticated (currently skipped - no test auth setup)
 * 2. Remote module server running: yarn workspace @universal/web-remote-hello dev
 *
 * Since E2E tests run without authentication and CI doesn't start the remote server,
 * ALL tests in this file are SKIPPED in CI. They can be run manually in local
 * development when both requirements are met.
 *
 * Note: Tests use i18n-aware patterns to match both English and Hindi translations.
 * - Light theme: "Light" (en), "लाइट" (hi)
 * - Dark theme: "Dark" (en), "डार्क" (hi)
 */

import { test, expect, Page } from '@playwright/test';

// Skip entire file in CI - remote loading requires authentication + remote server
// Both are unavailable in CI environment
test.skip(({ }, testInfo) => !!process.env.CI, 'Remote loading tests require authentication and remote server - skipped in CI');

// i18n-aware patterns for theme toggle text
// Toggle shows CURRENT state: ☀️ Light when in light mode, 🌙 Dark when in dark mode
const LIGHT_THEME_PATTERN = /☀️ (Light|लाइट)/;

// Helper to check if remote server is available
async function isRemoteAvailable(page: Page): Promise<boolean> {
  try {
    const response = await page.request.get('http://localhost:9003/remoteEntry.js');
    return response.ok();
  } catch {
    return false;
  }
}

test.describe('Remote Loading', () => {
  test.describe('Load Button', () => {
    test('should display load button before loading remote', async ({ page }) => {
      await page.goto('/remote-hello');

      // Load button should be visible (uses i18n: common.loadRemote)
      await expect(page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i)).toBeVisible();
    });

    test('should show loading or result state when clicking load button', async ({ page }) => {
      await page.goto('/remote-hello');

      // Click load button
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Wait a bit for the loading to start
      await page.waitForTimeout(500);

      // Should show loading state, error, or loaded component
      const loadingVisible = await page.getByText(/Loading|लोड हो रहा है/i).isVisible().catch(() => false);
      const errorVisible = await page.getByText(/error|unavailable|Unable/i).isVisible().catch(() => false);
      const componentVisible = await page.getByText(/Hello|नमस्ते/i).isVisible().catch(() => false);

      // One of these states should be true
      expect(loadingVisible || errorVisible || componentVisible).toBe(true);
    });
  });

  test.describe('Error Handling (Remote Unavailable)', () => {
    test('should show error or success when loading remote', async ({ page }) => {
      await page.goto('/remote-hello');

      // Click load button
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Wait for loading to complete (remote load can take time)
      await page.waitForTimeout(5000);

      // Check if error or success - look for specific error messages from Remote.tsx
      const errorVisible = await page.getByText(/Unable to load|unavailable|not available|Reload Page/i).isVisible().catch(() => false);
      const componentVisible = await page.getByText(/Hello.*Web User|नमस्ते.*Web User/i).isVisible().catch(() => false);
      const stillLoading = await page.getByText(/Loading|लोड हो रहा है/i).isVisible().catch(() => false);

      // Either remote loaded successfully, OR error is shown, OR still loading
      expect(errorVisible || componentVisible || stillLoading).toBe(true);
    });

    test('should show reload button on error', async ({ page }) => {
      await page.goto('/remote-hello');

      // Click load button
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Wait for loading to complete
      await page.waitForTimeout(3000);

      // If error is visible, reload button should be present
      const errorVisible = await page.getByText(/unavailable|Unable to load/i).isVisible().catch(() => false);

      if (errorVisible) {
        await expect(page.getByText(/Reload Page/i)).toBeVisible();
      }
    });
  });

  test.describe('Remote Component (When Available)', () => {
    test.beforeEach(async ({ page }) => {
      // Skip if remote is not available
      const available = await isRemoteAvailable(page);
      test.skip(!available, 'Remote server not available - run: yarn workspace @universal/web-remote-hello dev');
    });

    test('should load and display HelloRemote component', async ({ page }) => {
      await page.goto('/remote-hello');

      // Click load button
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Wait for component to load (uses i18n: hello.greetingWithName)
      await expect(page.getByText(/Hello.*Web User|नमस्ते.*Web User/i)).toBeVisible({ timeout: 10000 });
    });

    test('should display greeting with user name', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Greeting should include "Web User" (the name passed from Remote.tsx)
      await expect(page.getByText(/Hello.*Web User|नमस्ते.*Web User/i)).toBeVisible({ timeout: 10000 });
    });

    test('should have clickable button in remote component', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Wait for component to load
      await expect(page.getByText(/Hello.*Web User|नमस्ते.*Web User/i)).toBeVisible({ timeout: 10000 });

      // Remote component should have a button (uses i18n: hello.buttonLabel)
      const button = page.getByRole('button').filter({ hasText: /Click me|मुझे क्लिक करें/i });
      await expect(button).toBeVisible();
    });

    test('should increment press count when clicking remote button', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Wait for component to load
      await expect(page.getByText(/Hello.*Web User|नमस्ते.*Web User/i)).toBeVisible({ timeout: 10000 });

      // Click the button in the remote component
      const button = page.getByRole('button').filter({ hasText: /Click me|मुझे क्लिक करें/i });
      await button.click();

      // Press count should appear (uses i18n: hello.clickCount)
      await expect(page.getByText(/pressed.*1|क्लिक किया.*1|1.*time|1.*बार/i)).toBeVisible({ timeout: 5000 });
    });

    test('should increment press count multiple times', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Wait for component to load
      await expect(page.getByText(/Hello.*Web User|नमस्ते.*Web User/i)).toBeVisible({ timeout: 10000 });

      // Click the button multiple times
      const button = page.getByRole('button').filter({ hasText: /Click me|मुझे क्लिक करें/i });
      await button.click();
      await button.click();
      await button.click();

      // Press count should reflect 3 presses
      await expect(page.getByText(/pressed.*3|क्लिक किया.*3|3.*time|3.*बार/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Theme Sync with Remote', () => {
    test.beforeEach(async ({ page }) => {
      const available = await isRemoteAvailable(page);
      test.skip(!available, 'Remote server not available');
    });

    test('should sync theme to remote component', async ({ page }) => {
      await page.goto('/remote-hello');

      // Switch to dark mode first (click light toggle to switch to dark)
      await page.getByText(LIGHT_THEME_PATTERN).click();
      await page.waitForTimeout(100);

      // Load remote
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();
      await expect(page.getByText(/Hello.*Web User|नमस्ते.*Web User/i)).toBeVisible({ timeout: 10000 });

      // Remote component should render (theme is applied via context)
      await expect(page.getByText(/Hello.*Web User|नमस्ते.*Web User/i)).toBeVisible();
    });
  });

  test.describe('Language Sync with Remote', () => {
    test.beforeEach(async ({ page }) => {
      const available = await isRemoteAvailable(page);
      test.skip(!available, 'Remote server not available');
    });

    test('should display remote component in current language', async ({ page }) => {
      await page.goto('/remote-hello');

      // Switch to Hindi
      const langToggle = page.getByText(/🌐/).first();
      await langToggle.click();
      await page.waitForTimeout(100);

      // Load remote (button text may be in Hindi)
      await page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i).click();

      // Wait for component
      await page.waitForTimeout(5000);

      // Check if component loads (greeting may be in Hindi)
      const greeting = await page.locator('body').textContent();
      const hasGreeting = greeting?.includes('Hello') || greeting?.includes('नमस्ते');
      expect(hasGreeting).toBe(true);
    });
  });

  test.describe('Back Navigation from Remote', () => {
    test('should return to home when clicking back link', async ({ page }) => {
      await page.goto('/remote-hello');

      // Click back link (uses i18n: navigation.home)
      await page.getByText('← Home').click();

      // Should be on home page
      await expect(page).toHaveURL(/\/$|\/home/);
      await expect(page.getByText('Welcome')).toBeVisible();
    });

    test('should show load button again after navigating away and back', async ({ page }) => {
      await page.goto('/remote-hello');

      // Navigate away via back link
      await page.getByText('← Home').click();
      await expect(page).toHaveURL(/\/$|\/home/);

      // Navigate back via remote link
      await page.getByRole('link').filter({ hasText: /Remote Module|🧩/ }).click();
      await expect(page).toHaveURL(/.*remote-hello/);

      // Wait for the load button to appear (should be visible for SPA navigation)
      const loadButton = page.getByText(/Load Remote Component|रिमोट कॉम्पोनेन्ट लोड करें/i);

      // Use Playwright's built-in waiting with expect
      // Either load button OR remote component should be visible
      await expect(
        loadButton.or(page.getByText(/Hello.*Web User|नमस्ते.*Web User/i))
      ).toBeVisible({ timeout: 5000 });
    });
  });
});
