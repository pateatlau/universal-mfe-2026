/**
 * Routing Tests
 *
 * Tests for navigation between pages, URL handling, and route transitions.
 * These tests do NOT require the remote module server to be running.
 *
 * NOTE: These tests run without authentication. Unauthenticated users are redirected
 * to /login, so tests focus on public auth page routing (login, signup, forgot-password).
 *
 * Note: Tests use i18n-aware patterns to match both English and Hindi translations.
 * - Light theme: "Light" (en), "लाइट" (hi)
 * - Dark theme: "Dark" (en), "डार्क" (hi)
 */

import { test, expect } from '@playwright/test';

// i18n-aware patterns for theme toggle text
const ANY_THEME_PATTERN = /☀️ (Light|लाइट)|🌙 (Dark|डार्क)/;

test.describe('Routing', () => {
  test.describe('Protected Route Redirects', () => {
    test('should redirect / to login for unauthenticated users', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL(/\/(login)?$/);
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });

    test('should redirect /home to login for unauthenticated users', async ({ page }) => {
      await page.goto('/home');
      await page.waitForURL(/.*login/);
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });

    test('should redirect /settings to login for unauthenticated users', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForURL(/.*login/);
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });

    test('should redirect /remote-hello to login for unauthenticated users', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.waitForURL(/.*login/);
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });
  });

  test.describe('Public Auth Page Navigation', () => {
    test('should navigate directly to login page', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
      await expect(page).toHaveURL(/.*login/);
    });

    test('should navigate directly to signup page', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.getByText(/Create|Sign Up/i).first()).toBeVisible();
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should navigate directly to forgot-password page', async ({ page }) => {
      await page.goto('/forgot-password');
      await expect(page.getByText(/Reset|Forgot/i).first()).toBeVisible();
      await expect(page).toHaveURL(/.*forgot-password/);
    });
  });

  test.describe('Link Navigation (Auth Pages)', () => {
    test('should navigate from login to signup via link', async ({ page }) => {
      await page.goto('/login');

      // Click sign up link
      await page.getByText(/Sign Up|Don't have an account/i).click();

      // Should be on signup page
      await expect(page).toHaveURL(/.*signup/);
      await expect(page.getByText(/Create|Sign Up/i).first()).toBeVisible();
    });

    test('should navigate from login to forgot-password via link', async ({ page }) => {
      await page.goto('/login');

      // Click forgot password link
      await page.getByText(/Forgot Password/i).click();

      // Should be on forgot password page
      await expect(page).toHaveURL(/.*forgot-password/);
    });

    test('should navigate from signup back to login via link', async ({ page }) => {
      await page.goto('/signup');

      // Click sign in link (should exist on signup page)
      await page.getByText(/Already have an account/i).click();

      // Should be on login page
      await expect(page).toHaveURL(/.*login/);
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });

    test('should navigate from forgot-password back to login via link', async ({ page }) => {
      await page.goto('/forgot-password');

      // Click back to login link
      await page.getByText(/Sign In|Back to login|Remember your password/i).click();

      // Should be on login page
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Header Navigation', () => {
    test('should navigate to login when clicking app title from signup', async ({ page }) => {
      await page.goto('/signup');

      // Click header title
      await page.getByText('Universal MFE').first().click();

      // Should redirect to login (since unauthenticated)
      await page.waitForURL(/\/(login)?$/);
    });

    test('header should persist across auth page changes', async ({ page }) => {
      // Verify header on login
      await page.goto('/login');
      await expect(page.getByText('Universal MFE')).toBeVisible();

      // Navigate to signup
      await page.goto('/signup');
      await expect(page.getByText('Universal MFE')).toBeVisible();

      // Navigate to forgot-password
      await page.goto('/forgot-password');
      await expect(page.getByText('Universal MFE')).toBeVisible();
    });
  });

  test.describe('Browser Navigation', () => {
    test('should handle browser back button on auth pages', async ({ page }) => {
      await page.goto('/login');
      await page.goto('/signup');

      // Go back
      await page.goBack();

      // Should be on login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('should handle browser forward button on auth pages', async ({ page }) => {
      await page.goto('/login');
      await page.goto('/signup');
      await page.goBack();

      // Go forward
      await page.goForward();

      // Should be on signup page
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should handle multiple navigation steps on auth pages', async ({ page }) => {
      // Navigate through auth pages
      await page.goto('/login');
      await page.goto('/signup');
      await page.goto('/forgot-password');
      await page.goto('/login');

      // Go back twice
      await page.goBack();
      await expect(page).toHaveURL(/.*forgot-password/);

      await page.goBack();
      await expect(page).toHaveURL(/.*signup/);

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/.*forgot-password/);
    });
  });

  test.describe('State Preservation', () => {
    test('should preserve theme across auth page navigation', async ({ page }) => {
      await page.goto('/login');

      // Get initial toggle text
      const initialToggle = await page.getByText(ANY_THEME_PATTERN).first().textContent();

      // Click to toggle theme
      await page.getByText(ANY_THEME_PATTERN).first().click();
      await page.waitForTimeout(100);

      // Navigate to signup
      await page.goto('/signup');

      // Toggle should be different (theme preserved)
      const toggleAfterNav = await page.getByText(ANY_THEME_PATTERN).first().textContent();
      expect(toggleAfterNav).not.toBe(initialToggle);
    });

    test('should be able to change language on auth pages', async ({ page }) => {
      await page.goto('/login');

      // Get current language display
      const initialLang = await page.getByText(/🌐/).first().textContent();

      // Click to cycle language
      await page.getByText(/🌐/).first().click();
      await page.waitForTimeout(100);

      // Get new language - should have changed
      const newLang = await page.getByText(/🌐/).first().textContent();
      expect(newLang).not.toBe(initialLang);

      // Verify language toggle works on other auth pages too
      await page.goto('/signup');
      const langOnSignup = await page.getByText(/🌐/).first().textContent();

      // Click to cycle language on signup page
      await page.getByText(/🌐/).first().click();
      await page.waitForTimeout(100);

      const newLangOnSignup = await page.getByText(/🌐/).first().textContent();
      expect(newLangOnSignup).not.toBe(langOnSignup);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle unknown routes gracefully', async ({ page }) => {
      // Navigate to non-existent route
      await page.goto('/non-existent-page');

      // App should not crash - either shows 404 or redirects to login
      // Header should still be visible
      await expect(page.getByText('Universal MFE')).toBeVisible();
    });
  });
});
