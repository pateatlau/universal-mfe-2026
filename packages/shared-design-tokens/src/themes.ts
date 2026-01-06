/**
 * Theme definitions.
 *
 * Themes compose semantic tokens into complete theme objects.
 * Each theme provides all the tokens needed for consistent styling.
 */

import { lightColors, darkColors, SemanticColors } from './semantic/colors';
import { semanticSpacing, SemanticSpacing } from './semantic/spacing';
import { fontSizes, fontWeights, lineHeights, letterSpacing } from './primitives/typography';
import { shadows, ShadowStyle } from './primitives/shadows';

/**
 * Complete theme structure.
 */
export interface Theme {
  name: 'light' | 'dark';
  colors: SemanticColors;
  spacing: SemanticSpacing;
  typography: {
    fontSizes: typeof fontSizes;
    fontWeights: typeof fontWeights;
    lineHeights: typeof lineHeights;
    letterSpacing: typeof letterSpacing;
  };
  shadows: Record<string, ShadowStyle>;
}

/**
 * Light theme.
 */
export const lightTheme: Theme = {
  name: 'light',
  colors: lightColors,
  spacing: semanticSpacing,
  typography: {
    fontSizes,
    fontWeights,
    lineHeights,
    letterSpacing,
  },
  shadows,
};

/**
 * Dark theme.
 */
export const darkTheme: Theme = {
  name: 'dark',
  colors: darkColors,
  spacing: semanticSpacing,
  typography: {
    fontSizes,
    fontWeights,
    lineHeights,
    letterSpacing,
  },
  shadows,
};

/**
 * Available themes.
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;
