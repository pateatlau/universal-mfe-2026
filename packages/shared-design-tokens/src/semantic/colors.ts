/**
 * Semantic color tokens.
 *
 * These tokens provide meaningful names for colors based on their purpose.
 * Components should ONLY use these tokens, never primitive colors directly.
 *
 * Benefits:
 * - Easy theme switching (light/dark)
 * - Consistent color usage across the app
 * - Rebranding by changing only these mappings
 */

import { colors } from '../primitives/colors';

/**
 * Semantic color token structure.
 * Each property represents a functional color category.
 */
export interface SemanticColors {
  // Surface colors (backgrounds)
  surface: {
    background: string;
    foreground: string;
    card: string;
    cardHover: string;
    elevated: string;
    overlay: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
  };

  // Border colors
  border: {
    default: string;
    subtle: string;
    strong: string;
    focus: string;
  };

  // Interactive element colors
  interactive: {
    primary: string;
    primaryHover: string;
    primaryPressed: string;
    secondary: string;
    secondaryHover: string;
    secondaryPressed: string;
    disabled: string;
  };

  // Status colors
  status: {
    success: string;
    successBackground: string;
    warning: string;
    warningBackground: string;
    error: string;
    errorBackground: string;
    info: string;
    infoBackground: string;
  };

  // Icon colors
  icon: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
}

/**
 * Light theme semantic colors.
 */
export const lightColors: SemanticColors = {
  surface: {
    background: colors.white,
    foreground: colors.gray[50],
    card: colors.white,
    cardHover: colors.gray[50],
    elevated: colors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[500],
    disabled: colors.gray[400],
    inverse: colors.white,
    link: colors.blue[600],
  },

  border: {
    default: colors.gray[200],
    subtle: colors.gray[100],
    strong: colors.gray[300],
    focus: colors.blue[500],
  },

  interactive: {
    primary: colors.blue[600],
    primaryHover: colors.blue[700],
    primaryPressed: colors.blue[800],
    secondary: colors.gray[100],
    secondaryHover: colors.gray[200],
    secondaryPressed: colors.gray[300],
    disabled: colors.gray[100],
  },

  status: {
    success: colors.green[600],
    successBackground: colors.green[50],
    warning: colors.yellow[600],
    warningBackground: colors.yellow[50],
    error: colors.red[600],
    errorBackground: colors.red[50],
    info: colors.blue[600],
    infoBackground: colors.blue[50],
  },

  icon: {
    primary: colors.gray[700],
    secondary: colors.gray[500],
    disabled: colors.gray[400],
    inverse: colors.white,
  },
};

/**
 * Dark theme semantic colors.
 */
export const darkColors: SemanticColors = {
  surface: {
    background: colors.gray[900],
    foreground: colors.gray[800],
    card: colors.gray[800],
    cardHover: colors.gray[700],
    elevated: colors.gray[700],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    tertiary: colors.gray[400],
    disabled: colors.gray[600],
    inverse: colors.gray[900],
    link: colors.blue[400],
  },

  border: {
    default: colors.gray[700],
    subtle: colors.gray[800],
    strong: colors.gray[600],
    focus: colors.blue[400],
  },

  interactive: {
    primary: colors.blue[500],
    primaryHover: colors.blue[400],
    primaryPressed: colors.blue[300],
    secondary: colors.gray[700],
    secondaryHover: colors.gray[600],
    secondaryPressed: colors.gray[500],
    disabled: colors.gray[800],
  },

  status: {
    success: colors.green[400],
    successBackground: colors.green[900],
    warning: colors.yellow[400],
    warningBackground: colors.yellow[900],
    error: colors.red[400],
    errorBackground: colors.red[900],
    info: colors.blue[400],
    infoBackground: colors.blue[900],
  },

  icon: {
    primary: colors.gray[200],
    secondary: colors.gray[400],
    disabled: colors.gray[600],
    inverse: colors.gray[900],
  },
};
