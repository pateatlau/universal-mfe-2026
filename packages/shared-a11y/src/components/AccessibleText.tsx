import React from 'react';
import { Text, TextProps, AccessibilityRole } from 'react-native';

/**
 * Props for AccessibleText component
 */
export interface AccessibleTextProps extends Omit<TextProps, 'role'> {
  /**
   * The semantic role of the text.
   * - 'header': For headings (h1-h6 equivalent)
   * - 'text': For regular text content (default)
   * - 'alert': For important messages that should be announced
   * - 'summary': For summary/description text
   */
  semanticRole?: 'header' | 'text' | 'alert' | 'summary';

  /**
   * The heading level (1-6) when role is 'header'.
   * Maps to aria-level on web.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Custom accessibility label. If not provided, the text content is used.
   */
  accessibilityLabel?: string;

  /**
   * Whether this text should be announced by screen readers when it changes.
   * When true, sets accessibilityLiveRegion to 'polite'.
   */
  announceChanges?: boolean;
}

/**
 * Accessible text component with proper semantic roles.
 *
 * Use this component instead of plain Text when you need:
 * - Proper heading semantics
 * - Alert announcements
 * - Live region updates
 *
 * @example
 * ```tsx
 * // Heading
 * <AccessibleText semanticRole="header" headingLevel={1}>
 *   Page Title
 * </AccessibleText>
 *
 * // Alert message
 * <AccessibleText semanticRole="alert">
 *   Error: Invalid email address
 * </AccessibleText>
 *
 * // Live updating content
 * <AccessibleText announceChanges>
 *   Items in cart: {count}
 * </AccessibleText>
 * ```
 */
export function AccessibleText({
  semanticRole = 'text',
  headingLevel,
  accessibilityLabel,
  announceChanges = false,
  children,
  ...props
}: AccessibleTextProps): React.ReactElement {
  // Map our simplified role to React Native's accessibilityRole
  const getAccessibilityRole = (): AccessibilityRole | undefined => {
    switch (semanticRole) {
      case 'header':
        return 'header';
      case 'alert':
        return 'alert';
      case 'summary':
        return 'summary';
      case 'text':
      default:
        return 'text';
    }
  };

  // Build accessibility props
  const accessibilityProps: Partial<TextProps> = {
    accessibilityRole: getAccessibilityRole(),
  };

  // Set accessibility label if provided
  if (accessibilityLabel) {
    accessibilityProps.accessibilityLabel = accessibilityLabel;
  }

  // Set live region for dynamic content
  if (announceChanges || semanticRole === 'alert') {
    accessibilityProps.accessibilityLiveRegion =
      semanticRole === 'alert' ? 'assertive' : 'polite';
  }

  // Set aria-level for headings (web only, but harmless on native)
  // React Native Web will pick this up
  const ariaProps: Record<string, unknown> = {};
  if (semanticRole === 'header' && headingLevel) {
    ariaProps['aria-level'] = headingLevel;
  }

  return (
    <Text {...props} {...accessibilityProps} {...ariaProps}>
      {children}
    </Text>
  );
}

export default AccessibleText;
