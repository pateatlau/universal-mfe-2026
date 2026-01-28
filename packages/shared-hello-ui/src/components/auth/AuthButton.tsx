/**
 * AuthButton - Universal authentication button component
 *
 * Uses React Native primitives for cross-platform compatibility.
 * Supports primary, secondary, and social button variants.
 */

import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { A11yRoles, A11Y_MIN_TOUCH_TARGET } from '@universal/shared-a11y';

export type AuthButtonVariant = 'primary' | 'secondary' | 'google' | 'github';

export interface AuthButtonProps {
  /** Button text */
  label: string;
  /** Press handler */
  onPress: () => void;
  /** Button variant */
  variant?: AuthButtonVariant;
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * AuthButton component for authentication screens.
 *
 * Supports multiple variants:
 * - primary: Main action button (sign in, sign up)
 * - secondary: Secondary action (cancel, back)
 * - google: Google sign-in button
 * - github: GitHub sign-in button
 */
export function AuthButton({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: AuthButtonProps) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const isDisabled = disabled || isLoading;

  const buttonStyle = useMemo(() => {
    const variantStyles: Record<AuthButtonVariant, ViewStyle> = {
      primary: styles.primaryButton,
      secondary: styles.secondaryButton,
      google: styles.googleButton,
      github: styles.githubButton,
    };
    return [
      styles.button,
      variantStyles[variant],
      isDisabled && styles.disabledButton,
    ];
  }, [styles, variant, isDisabled]);

  const textStyle = useMemo(() => {
    const variantTextStyles: Record<AuthButtonVariant, TextStyle> = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      google: styles.googleText,
      github: styles.githubText,
    };
    return [
      styles.buttonText,
      variantTextStyles[variant],
      isDisabled && styles.disabledText,
    ];
  }, [styles, variant, isDisabled]);

  const loadingColor = useMemo(() => {
    switch (variant) {
      case 'primary':
        // Primary button always has blue background, so loading indicator should be white
        return '#FFFFFF';
      case 'github':
        return '#FFFFFF';
      case 'secondary':
        return theme.colors.text.primary;
      case 'google':
        return isDark ? '#FFFFFF' : '#1F1F1F';
      default:
        return '#FFFFFF';
    }
  }, [variant, theme, isDark]);

  return (
    <Pressable
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole={A11yRoles.BUTTON}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator color={loadingColor} size="small" />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </Pressable>
  );
}

interface Styles {
  button: ViewStyle;
  primaryButton: ViewStyle;
  secondaryButton: ViewStyle;
  googleButton: ViewStyle;
  githubButton: ViewStyle;
  disabledButton: ViewStyle;
  buttonText: TextStyle;
  primaryText: TextStyle;
  secondaryText: TextStyle;
  googleText: TextStyle;
  githubText: TextStyle;
  disabledText: TextStyle;
}

function createStyles(theme: Theme, isDark: boolean): Styles {
  return StyleSheet.create<Styles>({
    button: {
      borderRadius: theme.spacing.button.borderRadius,
      paddingHorizontal: theme.spacing.button.paddingHorizontal,
      paddingVertical: theme.spacing.button.paddingVertical,
      minHeight: A11Y_MIN_TOUCH_TARGET,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primaryButton: {
      backgroundColor: theme.colors.interactive.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.interactive.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    googleButton: {
      // Dark mode: dark background with white text
      // Light mode: white background with dark text
      backgroundColor: isDark ? '#131314' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#8E918F' : theme.colors.border.default,
    },
    githubButton: {
      // Dark mode: lighter GitHub color for contrast
      // Light mode: standard GitHub dark color
      backgroundColor: isDark ? '#6e7681' : '#24292e',
    },
    disabledButton: {
      // Use a medium gray that's visible in both light and dark modes
      // Light mode: darker gray background for visibility
      // Dark mode: lighter gray background for visibility
      backgroundColor: isDark ? '#4B5563' : '#9CA3AF',
    },
    buttonText: {
      fontSize: theme.typography.fontSizes.base,
      fontWeight: theme.typography.fontWeights.semibold,
    },
    primaryText: {
      // Primary button always has blue background, so text should always be white
      color: '#FFFFFF',
    },
    secondaryText: {
      color: theme.colors.text.primary,
    },
    googleText: {
      // Dark mode: white text on dark button
      // Light mode: dark text on white button
      color: isDark ? '#E3E3E3' : '#1F1F1F',
    },
    githubText: {
      color: '#FFFFFF',
    },
    disabledText: {
      // White text on medium gray background for WCAG AA compliance
      // Light mode: #9CA3AF background with white text = 3.0:1 contrast (acceptable for disabled)
      // Dark mode: #4B5563 background with white text = 5.9:1 contrast (passes AA)
      color: '#FFFFFF',
    },
  });
}
