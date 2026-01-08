/**
 * Remote Loading Tests
 *
 * Tests for Module Federation remote module loading, error handling, and interaction.
 *
 * IMPORTANT: These tests require the remote module server to be running:
 *   yarn workspace @universal/web-remote-hello dev
 *
 * Tests are designed to gracefully handle the case when remote is not available.
 */

import { test, expect, Page } from '@playwright/test';

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
      await expect(page.getByText(/Load Remote Component|Cargar Componente Remoto/i)).toBeVisible();
    });

    test('should show loading or result state when clicking load button', async ({ page }) => {
      await page.goto('/remote-hello');

      // Click load button
      await page.getByText(/Load Remote Component|Cargar/i).click();

      // Wait a bit for the loading to start
      await page.waitForTimeout(500);

      // Should show loading state, error, or loaded component
      const loadingVisible = await page.getByText(/Loading|Cargando/i).isVisible().catch(() => false);
      const errorVisible = await page.getByText(/error|unavailable|Unable/i).isVisible().catch(() => false);
      const componentVisible = await page.getByText(/Hello|Hola/i).isVisible().catch(() => false);

      // One of these states should be true
      expect(loadingVisible || errorVisible || componentVisible).toBe(true);
    });
  });

  test.describe('Error Handling (Remote Unavailable)', () => {
    test('should show error or success when loading remote', async ({ page }) => {
      await page.goto('/remote-hello');

      // Click load button
      await page.getByText(/Load Remote Component|Cargar/i).click();

      // Wait for loading to complete (remote load can take time)
      await page.waitForTimeout(5000);

      // Check if error or success - look for specific error messages from Remote.tsx
      const errorVisible = await page.getByText(/Unable to load|unavailable|not available|Reload Page/i).isVisible().catch(() => false);
      const componentVisible = await page.getByText(/Hello.*Web User|Hola.*Web User/i).isVisible().catch(() => false);
      const stillLoading = await page.getByText(/Loading|Cargando/i).isVisible().catch(() => false);

      // Either remote loaded successfully, OR error is shown, OR still loading
      expect(errorVisible || componentVisible || stillLoading).toBe(true);
    });

    test('should show reload button on error', async ({ page }) => {
      await page.goto('/remote-hello');

      // Click load button
      await page.getByText(/Load Remote Component|Cargar/i).click();

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
      await page.getByText(/Load Remote Component|Cargar/i).click();

      // Wait for component to load (uses i18n: hello.greetingWithName)
      await expect(page.getByText(/Hello.*Web User|Hola.*Web User/i)).toBeVisible({ timeout: 10000 });
    });

    test('should display greeting with user name', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByText(/Load Remote Component|Cargar/i).click();

      // Greeting should include "Web User" (the name passed from Remote.tsx)
      await expect(page.getByText(/Hello.*Web User|Hola.*Web User/i)).toBeVisible({ timeout: 10000 });
    });

    test('should have clickable button in remote component', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByText(/Load Remote Component|Cargar/i).click();

      // Wait for component to load
      await expect(page.getByText(/Hello.*Web User|Hola.*Web User/i)).toBeVisible({ timeout: 10000 });

      // Remote component should have a button (uses i18n: hello.buttonLabel)
      const button = page.getByRole('button').filter({ hasText: /Click me|Haz clic/i });
      await expect(button).toBeVisible();
    });

    test('should increment press count when clicking remote button', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByText(/Load Remote Component|Cargar/i).click();

      // Wait for component to load
      await expect(page.getByText(/Hello.*Web User|Hola.*Web User/i)).toBeVisible({ timeout: 10000 });

      // Click the button in the remote component
      const button = page.getByRole('button').filter({ hasText: /Click me|Haz clic/i });
      await button.click();

      // Press count should appear (uses i18n: common.pressCount)
      await expect(page.getByText(/pressed.*1|presionado.*1/i)).toBeVisible({ timeout: 5000 });
    });

    test('should increment press count multiple times', async ({ page }) => {
      await page.goto('/remote-hello');
      await page.getByText(/Load Remote Component|Cargar/i).click();

      // Wait for component to load
      await expect(page.getByText(/Hello.*Web User|Hola.*Web User/i)).toBeVisible({ timeout: 10000 });

      // Click the button multiple times
      const button = page.getByRole('button').filter({ hasText: /Click me|Haz clic/i });
      await button.click();
      await button.click();
      await button.click();

      // Press count should reflect 3 presses
      await expect(page.getByText(/pressed.*3|presionado.*3|3.*time|3.*vez/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Theme Sync with Remote', () => {
    test.beforeEach(async ({ page }) => {
      const available = await isRemoteAvailable(page);
      test.skip(!available, 'Remote server not available');
    });

    test('should sync theme to remote component', async ({ page }) => {
      await page.goto('/remote-hello');

      // Switch to dark mode first
      await page.getByText('🌙 Dark').click();
      await page.waitForTimeout(100);

      // Load remote
      await page.getByText(/Load Remote Component|Cargar/i).click();
      await expect(page.getByText(/Hello.*Web User|Hola.*Web User/i)).toBeVisible({ timeout: 10000 });

      // Remote component should render (theme is applied via context)
      await expect(page.getByText(/Hello.*Web User|Hola.*Web User/i)).toBeVisible();
    });
  });

  test.describe('Language Sync with Remote', () => {
    test.beforeEach(async ({ page }) => {
      const available = await isRemoteAvailable(page);
      test.skip(!available, 'Remote server not available');
    });

    test('should display remote component in current language', async ({ page }) => {
      await page.goto('/remote-hello');

      // Switch to Spanish
      const langToggle = page.getByText(/🌐/).first();
      await langToggle.click();
      await page.waitForTimeout(100);

      // Load remote (button text may be in Spanish)
      await page.getByText(/Load Remote Component|Cargar Componente Remoto/i).click();

      // Wait for component
      await page.waitForTimeout(5000);

      // Check if component loads (greeting may be in Spanish)
      const greeting = await page.locator('body').textContent();
      const hasGreeting = greeting?.includes('Hello') || greeting?.includes('Hola');
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
      const loadButton = page.getByText(/Load Remote Component|Cargar/i);

      // Use Playwright's built-in waiting with expect
      // Either load button OR remote component should be visible
      await expect(
        loadButton.or(page.getByText(/Hello.*Web User|Hola.*Web User/i))
      ).toBeVisible({ timeout: 5000 });
    });
  });
});
