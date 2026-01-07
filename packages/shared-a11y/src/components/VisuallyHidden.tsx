import React from 'react';
import { View, Text, StyleSheet, ViewProps, TextProps } from 'react-native';

/**
 * Props for VisuallyHidden component
 */
export interface VisuallyHiddenProps {
  /**
   * Content to hide visually but keep accessible
   */
  children: React.ReactNode;

  /**
   * Whether to use Text or View as the container.
   * Use 'text' when wrapping text-only content for proper semantics.
   * @default 'view'
   */
  as?: 'view' | 'text';

  /**
   * Additional props to pass to the container
   */
  containerProps?: ViewProps | TextProps;
}

/**
 * Visually hides content while keeping it accessible to screen readers.
 *
 * Use this component for:
 * - Providing additional context to screen reader users
 * - Labels for icon-only buttons
 * - Status messages that shouldn't be visually displayed
 * - Skip link destinations
 *
 * The content is positioned off-screen using CSS techniques that keep it
 * in the accessibility tree. This is different from `display: none` or
 * `visibility: hidden` which would hide content from screen readers too.
 *
 * @example
 * ```tsx
 * // Additional context for screen readers
 * <Pressable onPress={handleDelete}>
 *   <Icon name="trash" />
 *   <VisuallyHidden as="text">Delete item</VisuallyHidden>
 * </Pressable>
 *
 * // Status indicator with screen reader text
 * <View>
 *   <View style={styles.greenDot} />
 *   <VisuallyHidden as="text">Status: Online</VisuallyHidden>
 * </View>
 *
 * // Form field hint (when visual hint is icon-based)
 * <VisuallyHidden as="text">
 *   Password must contain at least 8 characters
 * </VisuallyHidden>
 * ```
 */
export function VisuallyHidden({
  children,
  as = 'view',
  containerProps,
}: VisuallyHiddenProps): React.ReactElement {
  if (as === 'text') {
    return (
      <Text
        {...(containerProps as TextProps)}
        style={[styles.visuallyHidden, (containerProps as TextProps)?.style]}
        accessibilityRole="text"
      >
        {children}
      </Text>
    );
  }

  return (
    <View
      {...(containerProps as ViewProps)}
      style={[styles.visuallyHidden, (containerProps as ViewProps)?.style]}
      accessible
      accessibilityRole="none"
    >
      {children}
    </View>
  );
}

/**
 * Visually hidden styles that keep content accessible.
 *
 * These styles can be used directly if you need more control:
 *
 * @example
 * ```tsx
 * import { visuallyHiddenStyle } from '@universal/shared-a11y';
 *
 * <Text style={[styles.label, isHidden && visuallyHiddenStyle]}>
 *   {label}
 * </Text>
 * ```
 */
export const visuallyHiddenStyle = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    // Note: clip is deprecated in CSS but still works
    // React Native doesn't support clipPath
    // The combination of width/height 1px and overflow hidden achieves the same effect
  },
}).container;

const styles = StyleSheet.create({
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
  },
});

export default VisuallyHidden;
