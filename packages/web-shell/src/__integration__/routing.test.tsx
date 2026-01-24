/**
 * Integration tests for routing
 *
 * Tests verify that routing works correctly with providers:
 * - Route transitions between pages
 * - URL navigation preserves provider state
 * - Route rendering with theme and i18n
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes as RouterRoutes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@universal/shared-theme-context';
import { I18nProvider, useTranslation, useLocale, locales } from '@universal/shared-i18n';
import { EventBusProvider } from '@universal/shared-event-bus';
import { QueryProvider } from '@universal/shared-data-layer';
import { Routes } from '@universal/shared-router';

/**
 * Test wrapper with all providers and routing
 */
function TestProviders({
  children,
  initialEntries = ['/'],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
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

/**
 * Simple Home page component for testing
 */
function HomePage() {
  const { theme } = useTheme();
  const { t } = useTranslation('common');

  return (
    <div data-testid="home-page" style={{ backgroundColor: theme.colors.surface.background }}>
      <h1 data-testid="home-title">{t('welcome')}</h1>
      <Link to={`/${Routes.SETTINGS}`} data-testid="settings-link">
        Go to Settings
      </Link>
      <Link to={`/${Routes.REMOTE_HELLO}`} data-testid="remote-link">
        Go to Remote
      </Link>
    </div>
  );
}

/**
 * Simple Settings page component for testing
 */
function SettingsPage() {
  const { theme, themeName, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('common');

  return (
    <div data-testid="settings-page" style={{ backgroundColor: theme.colors.surface.background }}>
      <h1 data-testid="settings-title">{t('navigation.settings')}</h1>
      <span data-testid="current-theme">{themeName}</span>
      <span data-testid="current-locale">{locale}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-hindi" onClick={() => setLocale('hi')}>
        Hindi
      </button>
      <Link to={`/${Routes.HOME}`} data-testid="home-link">
        Back to Home
      </Link>
    </div>
  );
}

/**
 * Simple Remote page component for testing
 */
function RemotePage() {
  const { theme, themeName } = useTheme();
  const { locale } = useLocale();
  const { t } = useTranslation('common');

  return (
    <div data-testid="remote-page" style={{ backgroundColor: theme.colors.surface.background }}>
      <h1 data-testid="remote-title">{t('hello.greeting')}</h1>
      <span data-testid="remote-theme">{themeName}</span>
      <span data-testid="remote-locale">{locale}</span>
      <Link to="/" data-testid="back-home">
        Back Home
      </Link>
    </div>
  );
}

/**
 * Location display component for testing URL changes
 */
function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="current-location">{location.pathname}</span>;
}

/**
 * Test app with routes
 */
function TestApp() {
  return (
    <>
      <LocationDisplay />
      <RouterRoutes>
        <Route path="/" element={<HomePage />} />
        <Route path={`/${Routes.HOME}`} element={<HomePage />} />
        <Route path={`/${Routes.SETTINGS}`} element={<SettingsPage />} />
        <Route path={`/${Routes.REMOTE_HELLO}`} element={<RemotePage />} />
      </RouterRoutes>
    </>
  );
}

describe('Routing Integration', () => {
  describe('Route transitions', () => {
    it('renders home page at root path', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByTestId('current-location')).toHaveTextContent('/');
    });

    it('navigates from home to settings', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('settings-link'));

      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      expect(screen.getByTestId('current-location')).toHaveTextContent('/settings');
    });

    it('navigates from home to remote', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      fireEvent.click(screen.getByTestId('remote-link'));

      expect(screen.getByTestId('remote-page')).toBeInTheDocument();
      expect(screen.getByTestId('current-location')).toHaveTextContent('/remote-hello');
    });

    it('navigates back from settings to home', () => {
      render(
        <TestProviders initialEntries={['/settings']}>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('settings-page')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('home-link'));

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByTestId('current-location')).toHaveTextContent('/home');
    });
  });

  describe('State preservation across routes', () => {
    it('preserves theme state when navigating', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      // Navigate to settings and change theme
      fireEvent.click(screen.getByTestId('settings-link'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Navigate to remote page (via home-link from settings, then remote-link from home)
      fireEvent.click(screen.getByTestId('home-link'));
      fireEvent.click(screen.getByTestId('remote-link'));

      // Theme should persist
      expect(screen.getByTestId('remote-theme')).toHaveTextContent('dark');
    });

    it('preserves locale state when navigating', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      // Navigate to settings and change locale
      fireEvent.click(screen.getByTestId('settings-link'));
      expect(screen.getByTestId('current-locale')).toHaveTextContent('en');

      fireEvent.click(screen.getByTestId('set-spanish'));
      expect(screen.getByTestId('current-locale')).toHaveTextContent('hi');

      // Navigate to remote page (via home-link from settings, then remote-link from home)
      fireEvent.click(screen.getByTestId('home-link'));
      fireEvent.click(screen.getByTestId('remote-link'));

      // Locale should persist
      expect(screen.getByTestId('remote-locale')).toHaveTextContent('hi');
    });

    it('preserves both theme and locale when navigating', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      // Navigate to settings and change both
      fireEvent.click(screen.getByTestId('settings-link'));

      fireEvent.click(screen.getByTestId('toggle-theme'));
      fireEvent.click(screen.getByTestId('set-spanish'));

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('current-locale')).toHaveTextContent('hi');

      // Navigate through multiple pages (via home-link from settings, then remote-link from home)
      fireEvent.click(screen.getByTestId('home-link'));
      fireEvent.click(screen.getByTestId('remote-link'));

      // Both should persist
      expect(screen.getByTestId('remote-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('remote-locale')).toHaveTextContent('hi');

      // Navigate back to settings (via back-home from remote, then settings-link from home)
      fireEvent.click(screen.getByTestId('back-home'));
      fireEvent.click(screen.getByTestId('settings-link'));

      // Still persisted
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('current-locale')).toHaveTextContent('hi');
    });
  });

  describe('Initial route rendering', () => {
    it('can start at settings page', () => {
      render(
        <TestProviders initialEntries={['/settings']}>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      expect(screen.getByTestId('current-location')).toHaveTextContent('/settings');
    });

    it('can start at remote page', () => {
      render(
        <TestProviders initialEntries={['/remote-hello']}>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('remote-page')).toBeInTheDocument();
      expect(screen.getByTestId('current-location')).toHaveTextContent('/remote-hello');
    });
  });
});
