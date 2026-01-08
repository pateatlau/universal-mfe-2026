/**
 * ThemeProvider - React context provider for theming.
 *
 * Provides theme state and toggle functionality to the component tree.
 * Works across web and mobile platforms.
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from '@universal/shared-theme-context';
 *
 * function App() {
 *   return (
 *     <ThemeProvider defaultTheme="light">
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */

import React, { createContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { Theme, ThemeName, lightTheme, darkTheme } from '@universal/shared-design-tokens';

/**
 * Storage key for persisting theme preference.
 */
const THEME_STORAGE_KEY = '@universal/theme';

/**
 * Check if we're in a browser environment with localStorage support.
 * React Native doesn't have window.localStorage or window.addEventListener.
 */
const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined' &&
  typeof window.addEventListener === 'function';

/**
 * Theme context value type.
 */
export interface ThemeContextValue {
  /** Current theme object */
  theme: Theme;
  /** Current theme name */
  themeName: ThemeName;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
  /** Set a specific theme */
  setTheme: (themeName: ThemeName) => void;
}

/**
 * Theme context - use useTheme() hook to access.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider props.
 */
export interface ThemeProviderProps {
  /** Child components */
  children: ReactNode;
  /** Initial theme (defaults to 'light') */
  defaultTheme?: ThemeName;
  /** Callback when theme changes */
  onThemeChange?: (themeName: ThemeName) => void;
}

/**
 * Get initial theme from storage or default.
 */
function getInitialTheme(defaultTheme: ThemeName): ThemeName {
  if (!isBrowser) {
    return defaultTheme;
  }
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // localStorage not available (SSR, privacy mode, etc.)
  }
  return defaultTheme;
}

/**
 * ThemeProvider component.
 *
 * Wraps your app to provide theme context to all descendants.
 * Theme preference is persisted to localStorage.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  onThemeChange,
}: ThemeProviderProps) {
  const [themeName, setThemeNameState] = useState<ThemeName>(() =>
    getInitialTheme(defaultTheme)
  );

  const theme = themeName === 'dark' ? darkTheme : lightTheme;
  const isDark = themeName === 'dark';

  const setTheme = useCallback(
    (newThemeName: ThemeName) => {
      setThemeNameState(newThemeName);
      // Persist to localStorage (web only)
      if (isBrowser) {
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, newThemeName);
        } catch {
          // localStorage not available
        }
      }
      onThemeChange?.(newThemeName);
    },
    [onThemeChange]
  );

  const toggleTheme = useCallback(() => {
    const newThemeName = themeName === 'light' ? 'dark' : 'light';
    setTheme(newThemeName);
  }, [themeName, setTheme]);

  // Sync with localStorage on mount (web only - for cross-tab sync)
  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as ThemeName;
        if (newTheme === 'light' || newTheme === 'dark') {
          setThemeNameState(newTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeName,
      isDark,
      toggleTheme,
      setTheme,
    }),
    [theme, themeName, isDark, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
