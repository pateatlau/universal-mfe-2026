/**
 * Integration tests for mobile navigation
 *
 * Tests verify that routing works correctly with providers:
 * - Route transitions between screens
 * - Navigation preserves provider state
 * - Route rendering with theme and i18n
 *
 * Note: Uses @testing-library/react with react-native mocks since
 * @testing-library/react-native requires the full RN runtime.
 */

import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  MemoryRouter,
  Routes as RouterRoutes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import { ThemeProvider, useTheme } from '@universal/shared-theme-context';
import {
  I18nProvider,
  useTranslation,
  useLocale,
  locales,
} from '@universal/shared-i18n';
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
        <EventBusProvider options={{ debug: false, name: 'TestMobile' }}>
          <I18nProvider translations={locales} initialLocale="en">
            <ThemeProvider>{children}</ThemeProvider>
          </I18nProvider>
        </EventBusProvider>
      </QueryProvider>
    </MemoryRouter>
  );
}

/**
 * Simple Home screen component for testing
 */
function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation('common');

  return (
    <View
      testID="home-screen"
      style={{ backgroundColor: theme.colors.surface.background }}
    >
      <Text testID="home-title">{t('welcome')}</Text>
      <Link to={`/${Routes.SETTINGS}`}>
        <Pressable testID="settings-link">
          <Text>Go to Settings</Text>
        </Pressable>
      </Link>
      <Link to={`/${Routes.REMOTE_HELLO}`}>
        <Pressable testID="remote-link">
          <Text>Go to Remote</Text>
        </Pressable>
      </Link>
    </View>
  );
}

/**
 * Simple Settings screen component for testing
 */
function SettingsScreen() {
  const { theme, themeName, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('common');

  return (
    <View
      testID="settings-screen"
      style={{ backgroundColor: theme.colors.surface.background }}
    >
      <Text testID="settings-title">{t('navigation.settings')}</Text>
      <Text testID="current-theme">{themeName}</Text>
      <Text testID="current-locale">{locale}</Text>
      <Pressable testID="toggle-theme" onPress={toggleTheme}>
        <Text>Toggle Theme</Text>
      </Pressable>
      <Pressable testID="set-hindi" onPress={() => setLocale('hi')}>
        <Text>Hindi</Text>
      </Pressable>
      <Link to={`/${Routes.HOME}`}>
        <Pressable testID="home-link">
          <Text>Back to Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

/**
 * Simple Remote screen component for testing
 */
function RemoteScreen() {
  const { theme, themeName } = useTheme();
  const { locale } = useLocale();
  const { t } = useTranslation('common');

  return (
    <View
      testID="remote-screen"
      style={{ backgroundColor: theme.colors.surface.background }}
    >
      <Text testID="remote-title">{t('hello.greeting')}</Text>
      <Text testID="remote-theme">{themeName}</Text>
      <Text testID="remote-locale">{locale}</Text>
      <Link to="/">
        <Pressable testID="back-home">
          <Text>Back Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

/**
 * Location display component for testing URL changes
 */
function LocationDisplay() {
  const location = useLocation();
  return <Text testID="current-location">{location.pathname}</Text>;
}

/**
 * Test app with routes
 */
function TestApp() {
  return (
    <>
      <LocationDisplay />
      <RouterRoutes>
        <Route path="/" element={<HomeScreen />} />
        <Route path={`/${Routes.HOME}`} element={<HomeScreen />} />
        <Route path={`/${Routes.SETTINGS}`} element={<SettingsScreen />} />
        <Route path={`/${Routes.REMOTE_HELLO}`} element={<RemoteScreen />} />
      </RouterRoutes>
    </>
  );
}

describe('Mobile Navigation Integration', () => {
  describe('Route transitions', () => {
    it('renders home screen at root path', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('home-screen')).toBeTruthy();
      expect(screen.getByTestId('current-location')).toHaveTextContent('/');
    });

    it('navigates from home to settings', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('home-screen')).toBeTruthy();

      fireEvent.click(screen.getByTestId('settings-link'));

      expect(screen.getByTestId('settings-screen')).toBeTruthy();
      expect(screen.getByTestId('current-location')).toHaveTextContent(
        '/settings'
      );
    });

    it('navigates from home to remote', () => {
      render(
        <TestProviders>
          <TestApp />
        </TestProviders>
      );

      fireEvent.click(screen.getByTestId('remote-link'));

      expect(screen.getByTestId('remote-screen')).toBeTruthy();
      expect(screen.getByTestId('current-location')).toHaveTextContent(
        '/remote-hello'
      );
    });

    it('navigates back from settings to home', () => {
      render(
        <TestProviders initialEntries={['/settings']}>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('settings-screen')).toBeTruthy();

      fireEvent.click(screen.getByTestId('home-link'));

      expect(screen.getByTestId('home-screen')).toBeTruthy();
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

      // Navigate to remote screen (via home-link from settings, then remote-link from home)
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

      fireEvent.click(screen.getByTestId('set-hindi'));
      expect(screen.getByTestId('current-locale')).toHaveTextContent('hi');

      // Navigate to remote screen (via home-link from settings, then remote-link from home)
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
      fireEvent.click(screen.getByTestId('set-hindi'));

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('current-locale')).toHaveTextContent('hi');

      // Navigate through multiple screens (via home-link from settings, then remote-link from home)
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
    it('can start at settings screen', () => {
      render(
        <TestProviders initialEntries={['/settings']}>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('settings-screen')).toBeTruthy();
      expect(screen.getByTestId('current-location')).toHaveTextContent(
        '/settings'
      );
    });

    it('can start at remote screen', () => {
      render(
        <TestProviders initialEntries={['/remote-hello']}>
          <TestApp />
        </TestProviders>
      );

      expect(screen.getByTestId('remote-screen')).toBeTruthy();
      expect(screen.getByTestId('current-location')).toHaveTextContent(
        '/remote-hello'
      );
    });
  });
});
