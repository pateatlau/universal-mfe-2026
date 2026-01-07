/**
 * Primitive spacing scale.
 *
 * These are raw spacing values that should NOT be used directly in components.
 * Instead, use semantic tokens from ../semantic/spacing.ts
 *
 * Based on a 4px base unit for consistency.
 */

export const spacing = {
  0: 0,
  1: 4, // 0.25rem
  2: 8, // 0.5rem
  3: 12, // 0.75rem
  4: 16, // 1rem
  5: 20, // 1.25rem
  6: 24, // 1.5rem
  8: 32, // 2rem
  10: 40, // 2.5rem
  12: 48, // 3rem
  16: 64, // 4rem
  20: 80, // 5rem
  24: 96, // 6rem
  32: 128, // 8rem
} as const;

export type SpacingScale = typeof spacing;
export type SpacingKey = keyof SpacingScale;
