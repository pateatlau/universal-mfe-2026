/**
 * Semantic spacing tokens.
 *
 * These tokens provide meaningful names for spacing based on their purpose.
 * Components should use these tokens for consistent spacing.
 */

import { spacing } from '../primitives/spacing';

/**
 * Semantic spacing token structure.
 */
export interface SemanticSpacing {
  // Layout spacing
  layout: {
    screenPadding: number;
    sectionGap: number;
    contentPadding: number;
    cardPadding: number;
  };

  // Component spacing
  component: {
    gap: number;
    padding: number;
    paddingSmall: number;
    paddingLarge: number;
  };

  // Element spacing
  element: {
    gap: number;
    inlineGap: number;
    stackGap: number;
  };

  // Input/form spacing
  input: {
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
  };

  // Button spacing
  button: {
    paddingHorizontal: number;
    paddingVertical: number;
    gap: number;
  };
}

/**
 * Default semantic spacing values.
 * These are consistent across light and dark themes.
 */
export const semanticSpacing: SemanticSpacing = {
  layout: {
    screenPadding: spacing[4], // 16
    sectionGap: spacing[8], // 32
    contentPadding: spacing[6], // 24
    cardPadding: spacing[4], // 16
  },

  component: {
    gap: spacing[4], // 16
    padding: spacing[4], // 16
    paddingSmall: spacing[2], // 8
    paddingLarge: spacing[6], // 24
  },

  element: {
    gap: spacing[2], // 8
    inlineGap: spacing[2], // 8
    stackGap: spacing[3], // 12
  },

  input: {
    paddingHorizontal: spacing[3], // 12
    paddingVertical: spacing[2], // 8
    gap: spacing[2], // 8
  },

  button: {
    paddingHorizontal: spacing[4], // 16
    paddingVertical: spacing[2], // 8
    gap: spacing[2], // 8
  },
};
