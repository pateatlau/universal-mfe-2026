/**
 * @universal/shared-design-tokens
 *
 * Design tokens for the Universal Microfrontend Platform.
 *
 * Usage:
 * - Import themes for complete theme objects
 * - Import semantic tokens for individual categories
 * - AVOID importing primitives directly in components
 *
 * @example
 * ```tsx
 * import { lightTheme, darkTheme, Theme } from '@universal/shared-design-tokens';
 *
 * const styles = {
 *   container: {
 *     backgroundColor: theme.colors.surface.background,
 *     padding: theme.spacing.layout.screenPadding,
 *   },
 * };
 * ```
 */

// Theme exports (primary API)
export { lightTheme, darkTheme, themes } from './themes';
export type { Theme, ThemeName } from './themes';

// Semantic token exports
export { lightColors, darkColors } from './semantic/colors';
export type { SemanticColors } from './semantic/colors';
export { semanticSpacing } from './semantic/spacing';
export type { SemanticSpacing } from './semantic/spacing';

// Primitive exports (for advanced use cases only)
export { colors } from './primitives/colors';
export type { ColorPalette, ColorName, ColorShade } from './primitives/colors';
export { spacing } from './primitives/spacing';
export type { SpacingScale, SpacingKey } from './primitives/spacing';
export { fontSizes, fontWeights, lineHeights, letterSpacing } from './primitives/typography';
export type { FontSize, FontWeight, LineHeight, LetterSpacing } from './primitives/typography';
export { shadows } from './primitives/shadows';
export type { ShadowStyle, ShadowLevel } from './primitives/shadows';
