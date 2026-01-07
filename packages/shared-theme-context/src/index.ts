/**
 * @universal/shared-theme-context
 *
 * Theme context provider and hooks for the Universal Microfrontend Platform.
 *
 * Usage:
 * 1. Wrap your app with ThemeProvider
 * 2. Use useTheme() hook to access theme in components
 *
 * @example
 * ```tsx
 * // In your app root
 * import { ThemeProvider } from '@universal/shared-theme-context';
 *
 * function App() {
 *   return (
 *     <ThemeProvider defaultTheme="light">
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 *
 * // In any component
 * import { useTheme } from '@universal/shared-theme-context';
 *
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   // Use theme.colors, theme.spacing, etc.
 * }
 * ```
 */

// Provider
export { ThemeProvider, ThemeContext } from './ThemeProvider';
export type { ThemeProviderProps, ThemeContextValue } from './ThemeProvider';

// Hooks
export { useTheme, useThemeTokens, useThemeColors, useThemeSpacing } from './useTheme';

// Re-export theme types for convenience
export type { Theme, ThemeName } from '@universal/shared-design-tokens';
