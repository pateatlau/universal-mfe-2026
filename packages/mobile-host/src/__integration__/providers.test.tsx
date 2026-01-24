/**
 * Integration tests for mobile provider composition
 *
 * Tests verify that all providers work together correctly:
 * - ThemeProvider + I18nProvider composition
 * - QueryProvider setup
 * - Provider state management across the component tree
 *
 * Note: Uses @testing-library/react with react-native mocks since
 * @testing-library/react-native requires the full RN runtime.
 */

import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@universal/shared-theme-context';
import {
  I18nProvider,
  useTranslation,
  useLocale,
  locales,
} from '@universal/shared-i18n';
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
        <EventBusProvider options={{ debug: false, name: 'TestMobile' }}>
          <I18nProvider translations={locales} initialLocale="en">
            <ThemeProvider>{children}</ThemeProvider>
          </I18nProvider>
        </EventBusProvider>
      </QueryProvider>
    </MemoryRouter>
  );
}

describe('Mobile Provider Composition', () => {
  describe('ThemeProvider + I18nProvider', () => {
    function ThemeAndI18nConsumer() {
      const { theme, themeName, toggleTheme } = useTheme();
      const { t } = useTranslation('common');
      const { locale, setLocale } = useLocale();

      return (
        <View>
          <Text testID="theme-name">{themeName}</Text>
          <Text testID="bg-color">{theme.colors.surface.background}</Text>
          <Text testID="locale">{locale}</Text>
          <Text testID="translated">{t('appName')}</Text>
          <Pressable testID="toggle-theme" onPress={toggleTheme}>
            <Text>Toggle Theme</Text>
          </Pressable>
          <Pressable testID="set-hindi" onPress={() => setLocale('hi')}>
            <Text>Hindi</Text>
          </Pressable>
        </View>
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
      expect(screen.getByTestId('translated')).toHaveTextContent(
        'Universal MFE'
      );
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
      expect(screen.getByTestId('translated')).toHaveTextContent(
        'Universal MFE'
      );

      fireEvent.click(screen.getByTestId('set-spanish'));

      expect(screen.getByTestId('locale')).toHaveTextContent('hi');
      // Spanish translation for appName is the same as English
      expect(screen.getByTestId('translated')).toHaveTextContent(
        'Universal MFE'
      );
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
      fireEvent.click(screen.getByTestId('set-spanish'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('locale')).toHaveTextContent('hi');

      // Change theme again
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('locale')).toHaveTextContent('hi');
    });
  });

  describe('QueryProvider integration', () => {
    it('renders children without error', () => {
      render(
        <TestProviders>
          <Text testID="query-child">Query child rendered</Text>
        </TestProviders>
      );

      expect(screen.getByTestId('query-child')).toHaveTextContent(
        'Query child rendered'
      );
    });
  });

  describe('Full provider stack', () => {
    function FullStackConsumer() {
      const { themeName, toggleTheme } = useTheme();
      const { locale, setLocale } = useLocale();
      const { t } = useTranslation('common');

      return (
        <View>
          <Text testID="theme">{themeName}</Text>
          <Text testID="locale">{locale}</Text>
          <Text testID="greeting">{t('appName')}</Text>
          <Pressable testID="toggle" onPress={toggleTheme}>
            <Text>Toggle</Text>
          </Pressable>
          <Pressable testID="hindi" onPress={() => setLocale('hi')}>
            <Text>HI</Text>
          </Pressable>
        </View>
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
      fireEvent.click(screen.getByTestId('spanish'));
      expect(screen.getByTestId('locale')).toHaveTextContent('hi');
      expect(screen.getByTestId('greeting')).toHaveTextContent('Universal MFE');

      // Theme persists after locale change
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });
});
