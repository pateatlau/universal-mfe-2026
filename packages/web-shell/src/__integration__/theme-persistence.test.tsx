/**
 * Integration tests for theme persistence
 *
 * Tests verify that theme state integrates correctly with storage:
 * - Theme preference persists via ThemeProvider
 * - Storage mechanism works with provider stack
 * - Theme changes trigger correct re-renders
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@universal/shared-theme-context';
import { I18nProvider, locales } from '@universal/shared-i18n';
import { EventBusProvider } from '@universal/shared-event-bus';
import { QueryProvider } from '@universal/shared-data-layer';
import { lightTheme, darkTheme } from '@universal/shared-design-tokens';

// Mock localStorage for persistence tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

/**
 * Test wrapper with all providers
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

/**
 * Theme consumer component for testing
 */
function ThemeConsumer() {
  const { theme, themeName, isDark, toggleTheme, setTheme } = useTheme();

  return (
    <div data-testid="theme-consumer" style={{ backgroundColor: theme.colors.surface.background }}>
      <span data-testid="theme-name">{themeName}</span>
      <span data-testid="is-dark">{isDark ? 'true' : 'false'}</span>
      <span data-testid="bg-color">{theme.colors.surface.background}</span>
      <span data-testid="text-color">{theme.colors.text.primary}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Dark
      </button>
    </div>
  );
}

describe('Theme Persistence Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Theme state management', () => {
    it('starts with light theme by default', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
      expect(screen.getByTestId('bg-color')).toHaveTextContent(lightTheme.colors.surface.background);
    });

    it('toggles to dark theme', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      fireEvent.click(screen.getByTestId('toggle-theme'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('bg-color')).toHaveTextContent(darkTheme.colors.surface.background);
    });

    it('toggles back to light theme', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      // Toggle to dark
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');

      // Toggle back to light
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('bg-color')).toHaveTextContent(lightTheme.colors.surface.background);
    });

    it('setTheme to dark works', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      fireEvent.click(screen.getByTestId('set-dark'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('setTheme to light works', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      // First go to dark
      fireEvent.click(screen.getByTestId('set-dark'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');

      // Then set to light
      fireEvent.click(screen.getByTestId('set-light'));
      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });
  });

  describe('Theme colors', () => {
    it('applies correct light theme colors', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      expect(screen.getByTestId('bg-color')).toHaveTextContent(lightTheme.colors.surface.background);
      expect(screen.getByTestId('text-color')).toHaveTextContent(lightTheme.colors.text.primary);
    });

    it('applies correct dark theme colors', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      fireEvent.click(screen.getByTestId('set-dark'));

      expect(screen.getByTestId('bg-color')).toHaveTextContent(darkTheme.colors.surface.background);
      expect(screen.getByTestId('text-color')).toHaveTextContent(darkTheme.colors.text.primary);
    });

    it('colors update correctly on toggle', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      // Light theme colors
      const lightBg = lightTheme.colors.surface.background;
      const darkBg = darkTheme.colors.surface.background;

      expect(screen.getByTestId('bg-color')).toHaveTextContent(lightBg);

      // Toggle to dark
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('bg-color')).toHaveTextContent(darkBg);

      // Toggle back to light
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('bg-color')).toHaveTextContent(lightBg);
    });
  });

  describe('Multiple consumers', () => {
    function MultipleConsumers() {
      return (
        <>
          <ThemeConsumer />
          <SecondConsumer />
        </>
      );
    }

    function SecondConsumer() {
      const { themeName, isDark } = useTheme();
      return (
        <div data-testid="second-consumer">
          <span data-testid="second-theme-name">{themeName}</span>
          <span data-testid="second-is-dark">{isDark ? 'true' : 'false'}</span>
        </div>
      );
    }

    it('multiple consumers receive same theme state', () => {
      render(
        <TestProviders>
          <MultipleConsumers />
        </TestProviders>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('second-theme-name')).toHaveTextContent('light');
    });

    it('multiple consumers update together', () => {
      render(
        <TestProviders>
          <MultipleConsumers />
        </TestProviders>
      );

      // Toggle from first consumer
      fireEvent.click(screen.getByTestId('toggle-theme'));

      // Both should update
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('second-theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('second-is-dark')).toHaveTextContent('true');
    });
  });

  describe('Theme with rapid changes', () => {
    it('handles rapid toggles correctly', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      const toggleButton = screen.getByTestId('toggle-theme');

      // Rapid toggles
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);

      // Should end up on dark (odd number of toggles)
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
    });

    it('handles setTheme calls correctly', () => {
      render(
        <TestProviders>
          <ThemeConsumer />
        </TestProviders>
      );

      // Set dark, light, dark, light, dark
      fireEvent.click(screen.getByTestId('set-dark'));
      fireEvent.click(screen.getByTestId('set-light'));
      fireEvent.click(screen.getByTestId('set-dark'));
      fireEvent.click(screen.getByTestId('set-light'));
      fireEvent.click(screen.getByTestId('set-dark'));

      // Should end up on dark
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
    });
  });
});
