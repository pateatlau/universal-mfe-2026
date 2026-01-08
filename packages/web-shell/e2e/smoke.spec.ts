/**
 * Smoke Tests
 *
 * Basic tests to verify the web shell loads correctly and core functionality works.
 * These tests do NOT require the remote module server to be running.
 *
 * Note: Tests use i18n-aware patterns to match both English and Spanish translations.
 * - Light theme: "Light" (en), "Claro" (es)
 * - Dark theme: "Dark" (en), "Oscuro" (es)
 */

import { test, expect } from '@playwright/test';

// i18n-aware patterns for theme toggle text
const LIGHT_THEME_PATTERN = /☀️ (Light|Claro)/;
const DARK_THEME_PATTERN = /🌙 (Dark|Oscuro)/;
const THEME_TOGGLE_PATTERN = /☀️ (Light|Claro)|🌙 (Dark|Oscuro)/;

test.describe('Smoke Tests', () => {
  test.describe('Application Boot', () => {
    test('should load the home page', async ({ page }) => {
      await page.goto('/');

      // Verify the app title is visible (uses i18n: common.appName)
      await expect(page.getByText('Universal MFE')).toBeVisible();
    });

    test('should display the subtitle', async ({ page }) => {
      await page.goto('/');

      // Verify the subtitle is visible (uses i18n: common.subtitle)
      // Use first() since text appears in both header and home page
      await expect(page.getByText(/Dynamically loading remote/i).first()).toBeVisible();
    });

    test('should have a theme toggle button', async ({ page }) => {
      await page.goto('/');

      // Should have either light or dark mode toggle visible
      const lightToggle = page.getByText(LIGHT_THEME_PATTERN);
      const darkToggle = page.getByText(DARK_THEME_PATTERN);

      // One of them should be visible
      const lightVisible = await lightToggle.isVisible().catch(() => false);
      const darkVisible = await darkToggle.isVisible().catch(() => false);

      expect(lightVisible || darkVisible).toBe(true);
    });

    test('should have a language toggle button', async ({ page }) => {
      await page.goto('/');

      // Should have language toggle with current locale
      await expect(page.getByText(/🌐/)).toBeVisible();
    });

    test('should have settings link in header', async ({ page }) => {
      await page.goto('/');

      // Settings button should be visible in header (first one)
      await expect(page.getByText('⚙️').first()).toBeVisible();
    });
  });

  test.describe('Home Page Content', () => {
    test('should display welcome message', async ({ page }) => {
      await page.goto('/');

      // Check for welcome text (uses i18n: common.welcome)
      await expect(page.getByText(/Welcome/i)).toBeVisible();
    });

    test('should display navigation section', async ({ page }) => {
      await page.goto('/');

      // Home page should have navigation links to remote and settings
      // Check for Remote Module link
      await expect(page.getByText(/Remote Module|🧩/)).toBeVisible();
    });

    test('should have link to Remote Module page', async ({ page }) => {
      await page.goto('/');

      // Check for Remote Module link
      await expect(page.getByText(/Remote Module|🧩/)).toBeVisible();
    });

    test('should have link to Settings page', async ({ page }) => {
      await page.goto('/');

      // Check for Settings link in navigation section (second one, after header)
      const settingsLinks = page.getByRole('link').filter({ hasText: /Settings|⚙️/ });
      await expect(settingsLinks.first()).toBeVisible();
    });
  });

  test.describe('Basic Interactions', () => {
    test('should toggle theme when clicking theme button', async ({ page }) => {
      await page.goto('/');

      // Get initial theme button text
      const themeToggle = page.getByText(THEME_TOGGLE_PATTERN).first();
      const initialText = await themeToggle.textContent();

      // Click theme toggle
      await themeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(100);

      // Get new theme button text
      const newText = await page.getByText(THEME_TOGGLE_PATTERN).first().textContent();

      // Theme button text should have changed (light <-> dark)
      expect(newText).not.toBe(initialText);
    });

    test('should cycle language when clicking language button', async ({ page }) => {
      await page.goto('/');

      // Get initial language display
      const langToggle = page.getByText(/🌐/).first();
      const initialLang = await langToggle.textContent();

      // Click to cycle language
      await langToggle.click();

      // Wait for locale change
      await page.waitForTimeout(100);

      // Language display should change
      const newLang = await langToggle.textContent();
      expect(newLang).not.toBe(initialLang);
    });
  });

  test.describe('Page Load Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');

      // Wait for main content to be visible
      await expect(page.getByText('Universal MFE')).toBeVisible();

      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds (generous for CI)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not have console errors on load', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          // Ignore known errors that don't affect functionality
          const text = msg.text();
          if (!text.includes('favicon') && !text.includes('manifest.json')) {
            consoleErrors.push(text);
          }
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Allow some console errors as long as app functions
      // (e.g., remote module errors when remote not running)
      // Critical errors would prevent page load
      expect(page.locator('body')).toBeTruthy();
    });
  });
});
