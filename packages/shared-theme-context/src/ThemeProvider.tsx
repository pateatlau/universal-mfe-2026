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

import React, { createContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Theme, ThemeName, lightTheme, darkTheme } from '@universal/shared-design-tokens';

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
 * ThemeProvider component.
 *
 * Wraps your app to provide theme context to all descendants.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  onThemeChange,
}: ThemeProviderProps) {
  const [themeName, setThemeNameState] = useState<ThemeName>(defaultTheme);

  const theme = themeName === 'dark' ? darkTheme : lightTheme;
  const isDark = themeName === 'dark';

  const setTheme = useCallback(
    (newThemeName: ThemeName) => {
      setThemeNameState(newThemeName);
      onThemeChange?.(newThemeName);
    },
    [onThemeChange]
  );

  const toggleTheme = useCallback(() => {
    const newThemeName = themeName === 'light' ? 'dark' : 'light';
    setTheme(newThemeName);
  }, [themeName, setTheme]);

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
