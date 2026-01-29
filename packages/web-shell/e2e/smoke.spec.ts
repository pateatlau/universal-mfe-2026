/**
 * Smoke Tests
 *
 * Basic tests to verify the web shell loads correctly and core functionality works.
 * These tests do NOT require the remote module server to be running.
 *
 * NOTE: These tests run without authentication. Unauthenticated users are redirected
 * to /login, so tests use the login page which has theme/language toggles in the header.
 *
 * Note: Tests use i18n-aware patterns to match both English and Hindi translations.
 * - Light theme: "Light" (en), "लाइट" (hi)
 * - Dark theme: "Dark" (en), "डार्क" (hi)
 */

import { test, expect } from '@playwright/test';

// i18n-aware patterns for theme toggle text
// Toggle shows TARGET state: 🌙 Dark when in light mode, ☀️ Light when in dark mode
const DARK_THEME_PATTERN = /🌙 (Dark|डार्क)/;
const ANY_THEME_PATTERN = /☀️ (Light|लाइट)|🌙 (Dark|डार्क)/;

test.describe('Smoke Tests', () => {
  test.describe('Application Boot', () => {
    test('should load and redirect to login for unauthenticated users', async ({ page }) => {
      await page.goto('/');

      // Should redirect to login page
      await page.waitForURL(/\/(login)?$/);

      // Verify the app title is visible in header
      await expect(page.getByText('Universal MFE')).toBeVisible();
    });

    test('should display the subtitle', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL(/\/(login)?$/);

      // Verify the subtitle is visible in header
      await expect(page.getByText(/Dynamically loading remote/i).first()).toBeVisible();
    });

    test('should have a theme toggle button', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL(/\/(login)?$/);

      // Should have theme toggle visible (shows target state)
      await expect(page.getByText(ANY_THEME_PATTERN).first()).toBeVisible();
    });

    test('should have a language toggle button', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL(/\/(login)?$/);

      // Should have language toggle with globe icon
      await expect(page.getByText(/🌐/)).toBeVisible();
    });

    test('should display login form for unauthenticated users', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL(/\/(login)?$/);

      // Login form should be visible (use heading to avoid matching button)
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });
  });

  test.describe('Login Page Content', () => {
    test('should display email input', async ({ page }) => {
      await page.goto('/login');

      // Email input should be present
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    });

    test('should display password input', async ({ page }) => {
      await page.goto('/login');

      // Password input should be present
      await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    });

    test('should have sign in button', async ({ page }) => {
      await page.goto('/login');

      // Sign in button should be visible
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('should have link to sign up page', async ({ page }) => {
      await page.goto('/login');

      // Sign up link should be visible
      await expect(page.getByText(/Sign Up|Create account|Don't have an account/i)).toBeVisible();
    });

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/login');

      // Forgot password link should be visible
      await expect(page.getByText(/Forgot Password/i)).toBeVisible();
    });
  });

  test.describe('Basic Interactions', () => {
    test('should toggle theme when clicking theme button', async ({ page }) => {
      await page.goto('/login');

      // Get initial theme button text
      const themeToggle = page.getByText(ANY_THEME_PATTERN).first();
      const initialText = await themeToggle.textContent();

      // Click theme toggle
      await themeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(100);

      // Get new theme button text
      const newText = await page.getByText(ANY_THEME_PATTERN).first().textContent();

      // Theme button text should have changed (light <-> dark)
      expect(newText).not.toBe(initialText);
    });

    test('should cycle language when clicking language button', async ({ page }) => {
      await page.goto('/login');

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

    test('should navigate to signup page', async ({ page }) => {
      await page.goto('/login');

      // Click sign up link
      await page.getByText(/Sign Up|Don't have an account/i).click();

      // Should be on signup page
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/login');

      // Click forgot password link
      await page.getByText(/Forgot Password/i).click();

      // Should be on forgot password page
      await expect(page).toHaveURL(/.*forgot-password/);
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

    test('should not have critical console errors on load', async ({ page }) => {
      const criticalErrors: string[] = [];

      page.on('pageerror', (error) => {
        criticalErrors.push(error.message);
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should not have any page-crashing errors
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('Auth Page Navigation', () => {
    test('should navigate between auth pages', async ({ page }) => {
      // Start at login
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

      // Go to signup
      await page.goto('/signup');
      await expect(page.getByText(/Create|Sign Up/i).first()).toBeVisible();

      // Go to forgot password
      await page.goto('/forgot-password');
      await expect(page.getByText(/Reset|Forgot/i).first()).toBeVisible();

      // Go back to login
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });

    test('should maintain header across auth pages', async ({ page }) => {
      // Check header on login
      await page.goto('/login');
      await expect(page.getByText('Universal MFE')).toBeVisible();

      // Check header on signup
      await page.goto('/signup');
      await expect(page.getByText('Universal MFE')).toBeVisible();

      // Check header on forgot password
      await page.goto('/forgot-password');
      await expect(page.getByText('Universal MFE')).toBeVisible();
    });
  });
});
