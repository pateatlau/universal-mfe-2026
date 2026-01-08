/**
 * Routing Tests
 *
 * Tests for navigation between pages, URL handling, and route transitions.
 * These tests do NOT require the remote module server to be running.
 */

import { test, expect } from '@playwright/test';

test.describe('Routing', () => {
  test.describe('Direct URL Navigation', () => {
    test('should navigate to home page via /', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText(/Welcome/i)).toBeVisible();
    });

    test('should navigate to home page via /home', async ({ page }) => {
      await page.goto('/home');
      await expect(page.getByText(/Welcome/i)).toBeVisible();
    });

    test('should navigate to settings page via /settings', async ({ page }) => {
      await page.goto('/settings');
      // Settings page renders - header should be visible
      await expect(page.getByText('Universal MFE')).toBeVisible();
      // URL should be correct
      await expect(page).toHaveURL(/.*settings/);
    });

    test('should navigate to remote page via /remote-hello', async ({ page }) => {
      await page.goto('/remote-hello');
      // Remote page renders - header should be visible
      await expect(page.getByText('Universal MFE')).toBeVisible();
      // URL should be correct
      await expect(page).toHaveURL(/.*remote-hello/);
    });
  });

  test.describe('Link Navigation', () => {
    test('should navigate from home to settings via link', async ({ page }) => {
      await page.goto('/');

      // Click settings link in navigation (first matching link)
      await page.getByRole('link').filter({ hasText: /Settings|⚙️/ }).first().click();

      // Should be on settings page
      await expect(page).toHaveURL(/.*settings/);
    });

    test('should navigate from home to remote page via link', async ({ page }) => {
      await page.goto('/');

      // Click remote module link
      await page.getByRole('link').filter({ hasText: /Remote Module|🧩/ }).click();

      // Should be on remote page
      await expect(page).toHaveURL(/.*remote-hello/);
    });

    test('should navigate from settings back to home via header', async ({ page }) => {
      await page.goto('/');

      // Navigate to settings
      await page.getByRole('link').filter({ hasText: /Settings|⚙️/ }).first().click();
      await expect(page).toHaveURL(/.*settings/);

      // Click header title to go home
      await page.getByText('Universal MFE').first().click();

      // Should be on home page
      await expect(page).toHaveURL(/\/$|\/home/);
    });

    test('should navigate from remote page back to home via header', async ({ page }) => {
      await page.goto('/');

      // Navigate to remote
      await page.getByRole('link').filter({ hasText: /Remote Module|🧩/ }).click();
      await expect(page).toHaveURL(/.*remote-hello/);

      // Click header title to go home
      await page.getByText('Universal MFE').first().click();

      // Should be on home page
      await expect(page).toHaveURL(/\/$|\/home/);
    });
  });

  test.describe('Header Navigation', () => {
    test('should navigate to settings via header gear icon', async ({ page }) => {
      await page.goto('/');

      // Click settings icon in header (first one)
      await page.getByText('⚙️').first().click();

      // Should be on settings page
      await expect(page).toHaveURL(/.*settings/);
    });

    test('header should persist across route changes', async ({ page }) => {
      await page.goto('/');

      // Verify header on home
      await expect(page.getByText('Universal MFE')).toBeVisible();

      // Navigate to settings
      await page.goto('/settings');

      // Header should still be visible
      await expect(page.getByText('Universal MFE')).toBeVisible();

      // Navigate to remote
      await page.goto('/remote-hello');

      // Header should still be visible
      await expect(page.getByText('Universal MFE')).toBeVisible();
    });
  });

  test.describe('Browser Navigation', () => {
    test('should handle browser back button', async ({ page }) => {
      await page.goto('/');
      await page.goto('/settings');

      // Go back
      await page.goBack();

      // Should be on home page
      await expect(page).toHaveURL(/\/$|\/home/);
    });

    test('should handle browser forward button', async ({ page }) => {
      await page.goto('/');
      await page.goto('/settings');
      await page.goBack();

      // Go forward
      await page.goForward();

      // Should be on settings page
      await expect(page).toHaveURL(/.*settings/);
    });

    test('should handle multiple navigation steps', async ({ page }) => {
      // Navigate through multiple pages
      await page.goto('/');
      await page.goto('/settings');
      await page.goto('/remote-hello');
      await page.goto('/');

      // Go back twice
      await page.goBack();
      await expect(page).toHaveURL(/.*remote-hello/);

      await page.goBack();
      await expect(page).toHaveURL(/.*settings/);

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/.*remote-hello/);
    });
  });

  test.describe('State Preservation', () => {
    test('should be able to toggle theme on home page', async ({ page }) => {
      await page.goto('/');

      // Get initial toggle text
      const initialToggle = await page.getByText(/☀️ Light|🌙 Dark/).first().textContent();

      // Click to toggle
      await page.getByText(/☀️ Light|🌙 Dark/).first().click();
      await page.waitForTimeout(100);

      // Toggle text should change
      const newToggle = await page.getByText(/☀️ Light|🌙 Dark/).first().textContent();
      expect(newToggle).not.toBe(initialToggle);
    });

    test('should be able to change language on home page', async ({ page }) => {
      await page.goto('/');

      // Get current language display
      const initialLang = await page.getByText(/🌐/).first().textContent();

      // Click to cycle language
      await page.getByText(/🌐/).first().click();
      await page.waitForTimeout(100);

      // Language should change
      const newLang = await page.getByText(/🌐/).first().textContent();
      expect(newLang).not.toBe(initialLang);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle unknown routes gracefully', async ({ page }) => {
      // Navigate to non-existent route
      await page.goto('/non-existent-page');

      // App should not crash - header should still be visible
      await expect(page.getByText('Universal MFE')).toBeVisible();
    });
  });
});
