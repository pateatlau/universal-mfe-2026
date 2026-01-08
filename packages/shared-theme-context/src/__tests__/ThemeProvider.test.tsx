/**
 * Unit tests for ThemeProvider and useTheme hooks
 *
 * Tests cover:
 * - ThemeProvider initialization with default and custom themes
 * - Theme toggling functionality
 * - Theme change callbacks
 * - useTheme hook behavior
 * - Convenience hooks (useThemeTokens, useThemeColors, useThemeSpacing)
 * - Error handling when used outside provider
 */

import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import {
  ThemeProvider,
  useTheme,
  useThemeTokens,
  useThemeColors,
  useThemeSpacing,
} from '../index';
import { lightTheme, darkTheme } from '@universal/shared-design-tokens';

// Helper component to test theme context
function ThemeConsumer({ testId = 'theme-consumer' }: { testId?: string }) {
  const { theme, themeName, isDark, toggleTheme } = useTheme();

  return (
    <div data-testid={testId}>
      <span data-testid="theme-name">{themeName}</span>
      <span data-testid="is-dark">{isDark ? 'true' : 'false'}</span>
      <span data-testid="bg-color">{theme.colors.surface.background}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

// Helper component to test setTheme
function ThemeSetterConsumer() {
  const { themeName, setTheme } = useTheme();

  return (
    <div>
      <span data-testid="theme-name">{themeName}</span>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Dark
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  describe('initialization', () => {
    it('defaults to light theme when no defaultTheme provided', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    it('uses light theme when defaultTheme is light', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
      expect(screen.getByTestId('bg-color')).toHaveTextContent(
        lightTheme.colors.surface.background
      );
    });

    it('uses dark theme when defaultTheme is dark', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
      expect(screen.getByTestId('bg-color')).toHaveTextContent(
        darkTheme.colors.surface.background
      );
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('toggles from dark to light', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    it('toggles multiple times correctly', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeConsumer />
        </ThemeProvider>
      );

      const toggleBtn = screen.getByTestId('toggle-btn');

      // light -> dark
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');

      // dark -> light
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');

      // light -> dark
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
    });
  });

  describe('setTheme', () => {
    it('sets theme to light explicitly', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeSetterConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');

      fireEvent.click(screen.getByTestId('set-light'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
    });

    it('sets theme to dark explicitly', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeSetterConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('light');

      fireEvent.click(screen.getByTestId('set-dark'));

      expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
    });
  });

  describe('onThemeChange callback', () => {
    it('calls onThemeChange when theme is toggled', () => {
      const onThemeChange = jest.fn();

      render(
        <ThemeProvider defaultTheme="light" onThemeChange={onThemeChange}>
          <ThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(onThemeChange).toHaveBeenCalledTimes(1);
      expect(onThemeChange).toHaveBeenCalledWith('dark');
    });

    it('calls onThemeChange when setTheme is called', () => {
      const onThemeChange = jest.fn();

      render(
        <ThemeProvider defaultTheme="light" onThemeChange={onThemeChange}>
          <ThemeSetterConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));

      expect(onThemeChange).toHaveBeenCalledTimes(1);
      expect(onThemeChange).toHaveBeenCalledWith('dark');
    });

    it('calls onThemeChange with correct value on multiple changes', () => {
      const onThemeChange = jest.fn();

      render(
        <ThemeProvider defaultTheme="light" onThemeChange={onThemeChange}>
          <ThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('toggle-btn')); // -> dark
      fireEvent.click(screen.getByTestId('toggle-btn')); // -> light
      fireEvent.click(screen.getByTestId('toggle-btn')); // -> dark

      expect(onThemeChange).toHaveBeenCalledTimes(3);
      expect(onThemeChange).toHaveBeenNthCalledWith(1, 'dark');
      expect(onThemeChange).toHaveBeenNthCalledWith(2, 'light');
      expect(onThemeChange).toHaveBeenNthCalledWith(3, 'dark');
    });
  });

  describe('theme object', () => {
    it('provides correct light theme colors', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('bg-color')).toHaveTextContent(
        lightTheme.colors.surface.background
      );
    });

    it('provides correct dark theme colors', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('bg-color')).toHaveTextContent(
        darkTheme.colors.surface.background
      );
    });

    it('updates theme colors when toggled', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('bg-color')).toHaveTextContent(
        lightTheme.colors.surface.background
      );

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(screen.getByTestId('bg-color')).toHaveTextContent(
        darkTheme.colors.surface.background
      );
    });
  });
});

describe('useTheme', () => {
  it('throws error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('returns theme context value when inside provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.themeName).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(result.current.theme).toBe(lightTheme);
    expect(typeof result.current.toggleTheme).toBe('function');
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('updates when toggle is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.themeName).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.themeName).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(result.current.theme).toBe(darkTheme);
  });
});

describe('useThemeTokens', () => {
  it('throws error when used outside ThemeProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useThemeTokens());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('returns theme object', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useThemeTokens(), { wrapper });

    expect(result.current).toBe(lightTheme);
  });
});

describe('useThemeColors', () => {
  it('throws error when used outside ThemeProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useThemeColors());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('returns theme colors', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useThemeColors(), { wrapper });

    expect(result.current).toBe(lightTheme.colors);
  });

  it('returns dark theme colors when theme is dark', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useThemeColors(), { wrapper });

    expect(result.current).toBe(darkTheme.colors);
  });
});

describe('useThemeSpacing', () => {
  it('throws error when used outside ThemeProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useThemeSpacing());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('returns theme spacing', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useThemeSpacing(), { wrapper });

    expect(result.current).toBe(lightTheme.spacing);
  });
});
