/**
 * useTheme - Hook to access theme context.
 *
 * @example
 * ```tsx
 * import { useTheme } from '@universal/shared-theme-context';
 *
 * function MyComponent() {
 *   const { theme, isDark, toggleTheme } = useTheme();
 *
 *   return (
 *     <View style={{ backgroundColor: theme.colors.surface.background }}>
 *       <Text style={{ color: theme.colors.text.primary }}>
 *         Current theme: {isDark ? 'Dark' : 'Light'}
 *       </Text>
 *       <Button onPress={toggleTheme} title="Toggle Theme" />
 *     </View>
 *   );
 * }
 * ```
 */

import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from './ThemeProvider';

/**
 * Hook to access the current theme and theme controls.
 *
 * Must be used within a ThemeProvider.
 *
 * @returns Theme context value with theme, themeName, isDark, toggleTheme, setTheme
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to access just the theme object.
 *
 * Convenience hook when you only need the theme tokens.
 *
 * @returns Current theme object
 */
export function useThemeTokens() {
  const { theme } = useTheme();
  return theme;
}

/**
 * Hook to access theme colors.
 *
 * Convenience hook for accessing only color tokens.
 *
 * @returns Current theme color tokens
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Hook to access theme spacing.
 *
 * Convenience hook for accessing only spacing tokens.
 *
 * @returns Current theme spacing tokens
 */
export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}
