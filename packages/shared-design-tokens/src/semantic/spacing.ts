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
    borderRadius: number;
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
    borderRadius: number;
  };

  // Button spacing
  button: {
    paddingHorizontal: number;
    paddingHorizontalSmall: number;
    paddingVertical: number;
    paddingVerticalSmall: number;
    gap: number;
    borderRadius: number;
  };
}

/**
 * Default semantic spacing values.
 * These are consistent across light and dark themes.
 */
export const semanticSpacing: SemanticSpacing = {
  layout: {
    screenPadding: spacing[6], // 24
    sectionGap: spacing[8], // 32
    contentPadding: spacing[6], // 24
    cardPadding: spacing[4], // 16
  },

  component: {
    gap: spacing[4], // 16
    padding: spacing[4], // 16
    paddingSmall: spacing[2], // 8
    paddingLarge: spacing[6], // 24
    borderRadius: spacing[2], // 8
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
    borderRadius: spacing[2], // 8
  },

  button: {
    paddingHorizontal: spacing[6], // 24
    paddingHorizontalSmall: spacing[5], // 20
    paddingVertical: spacing[3], // 12
    paddingVerticalSmall: spacing[2], // 8
    gap: spacing[2], // 8
    borderRadius: spacing[2], // 8
  },
};
