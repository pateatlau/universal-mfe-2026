/**
 * Integration tests for provider composition
 *
 * Tests verify that all providers work together correctly:
 * - ThemeProvider + I18nProvider composition
 * - QueryProvider setup
 *
 * Note: EventBusProvider advanced tests (useEventListener hooks) are skipped
 * due to React module resolution issues in the monorepo test environment.
 * The EventBus core functionality is tested in shared-event-bus package.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@universal/shared-theme-context';
import { I18nProvider, useTranslation, useLocale, locales } from '@universal/shared-i18n';
import { EventBusProvider } from '@universal/shared-event-bus';
import { QueryProvider } from '@universal/shared-data-layer';
import { lightTheme, darkTheme } from '@universal/shared-design-tokens';

/**
 * Test wrapper with all providers configured like the real app
 */
function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <QueryProvider>
        <EventBusProvider options={{ debug: false, name: 'TestShell' }}>
          <I18nProvider translations={locales} initialLocale="en">
            <ThemeProvider>{children}</ThemeProvider>
          </I18nProvider>
        </EventBusProvider>
      </QueryProvider>
    </MemoryRouter>
  );
}

describe('Provider Composition', () => {
  describe('ThemeProvider + I18nProvider', () => {
    function ThemeAndI18nConsumer() {
      const { theme, themeName, toggleTheme } = useTheme();
      const { t } = useTranslation('common');
      const { locale, setLocale } = useLocale();

      return (
        <div>
          <span data-testid="theme-name">{themeName}</span>
          <span data-testid="bg-color">{theme.colors.surface.background}</span>
          <span data-testid="locale">{locale}</span>
          <span data-testid="translated">{t('appName')}</span>
          <button data-testid="toggle-theme" onClick={toggleTheme}>
            Toggle Theme
          </button>
          <button data-testid="set-hindi" onClick={() => setLocale('hi')}>
            Hindi
          </button>
        </div>
      );
    }

    it('renders with default theme and locale', () => {
      render(
        <TestProviders>
          <ThemeAndI18nConsumer />
        </TestProviders>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('locale')).toHaveTextContent('en');
      expect(screen.getByTestId('translated')).toHaveTextContent('Universal MFE');
    });

    it('theme toggle works with i18n active', () => {
      render(
        <TestProviders>
          <ThemeAndI18nConsumer />
        </TestProviders>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('bg-color')).toHaveTextContent(
        lightTheme.colors.surface.background
      );

      fireEvent.click(screen.getByTestId('toggle-theme'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('bg-color')).toHaveTextContent(
        darkTheme.colors.surface.background
      );
    });

    it('locale change works with theme active', () => {
      render(
        <TestProviders>
          <ThemeAndI18nConsumer />
        </TestProviders>
      );

      expect(screen.getByTestId('locale')).toHaveTextContent('en');
      expect(screen.getByTestId('translated')).toHaveTextContent('Universal MFE');

      fireEvent.click(screen.getByTestId('set-hindi'));

      expect(screen.getByTestId('locale')).toHaveTextContent('hi');
      // Hindi translation for appName is the same as English
      expect(screen.getByTestId('translated')).toHaveTextContent('Universal MFE');
    });

    it('theme and locale can both change independently', () => {
      render(
        <TestProviders>
          <ThemeAndI18nConsumer />
        </TestProviders>
      );

      // Initial state
      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('locale')).toHaveTextContent('en');

      // Change theme
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('locale')).toHaveTextContent('en');

      // Change locale
      fireEvent.click(screen.getByTestId('set-hindi'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('locale')).toHaveTextContent('hi');

      // Change theme again
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('locale')).toHaveTextContent('hi');
    });
  });

  describe('QueryProvider integration', () => {
    // QueryProvider is tested implicitly - if it's misconfigured, tests would fail
    // More detailed QueryClient tests are in shared-data-layer integration tests

    it('renders children without error', () => {
      render(
        <TestProviders>
          <div data-testid="query-child">Query child rendered</div>
        </TestProviders>
      );

      expect(screen.getByTestId('query-child')).toHaveTextContent('Query child rendered');
    });
  });

  describe('Full provider stack without EventBus hooks', () => {
    function FullStackConsumer() {
      const { themeName, toggleTheme } = useTheme();
      const { locale, setLocale } = useLocale();
      const { t } = useTranslation('common');

      return (
        <div>
          <span data-testid="theme">{themeName}</span>
          <span data-testid="locale">{locale}</span>
          <span data-testid="greeting">{t('appName')}</span>
          <button data-testid="toggle" onClick={toggleTheme}>
            Toggle
          </button>
          <button data-testid="hindi" onClick={() => setLocale('hi')}>
            HI
          </button>
        </div>
      );
    }

    it('theme and i18n providers work together in full stack', () => {
      render(
        <TestProviders>
          <FullStackConsumer />
        </TestProviders>
      );

      // Initial state
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('locale')).toHaveTextContent('en');
      expect(screen.getByTestId('greeting')).toHaveTextContent('Universal MFE');

      // Toggle theme
      fireEvent.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');

      // Change locale
      fireEvent.click(screen.getByTestId('hindi'));
      expect(screen.getByTestId('locale')).toHaveTextContent('hi');
      // Hindi translation for appName is the same as English
      expect(screen.getByTestId('greeting')).toHaveTextContent('Universal MFE');

      // Theme persists after locale change
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });
});
