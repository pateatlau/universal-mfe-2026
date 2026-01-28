/**
 * AuthInput - Universal authentication input component
 *
 * Uses React Native primitives for cross-platform compatibility.
 * Supports text, email, and password input types.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { A11yRoles } from '@universal/shared-a11y';

export type AuthInputType = 'text' | 'email' | 'password';

export interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChangeText: (text: string) => void;
  /** Input type */
  type?: AuthInputType;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * AuthInput component for authentication forms.
 *
 * Supports:
 * - Text, email, and password input types
 * - Password visibility toggle
 * - Error state display
 * - Full accessibility support
 */
export function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  error,
  disabled = false,
  accessibilityLabel,
  testID,
  ...textInputProps
}: AuthInputProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = type === 'password';
  const isEmail = type === 'email';

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const keyboardType = useMemo(() => {
    if (isEmail) return 'email-address';
    return 'default';
  }, [isEmail]);

  const inputContainerStyle = useMemo(
    () => [
      styles.inputContainer,
      error && styles.inputContainerError,
      disabled && styles.inputContainerDisabled,
    ],
    [styles, error, disabled]
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={styles.label}
          accessibilityRole={A11yRoles.TEXT}
        >
          {label}
        </Text>
      )}
      <View style={inputContainerStyle}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize={isEmail || isPassword ? 'none' : 'sentences'}
          autoCorrect={!(isEmail || isPassword)}
          autoComplete={isEmail ? 'email' : isPassword ? 'password' : 'off'}
          editable={!disabled}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          accessibilityState={{ disabled }}
          testID={testID}
          {...textInputProps}
        />
        {isPassword && (
          <Pressable
            style={styles.toggleButton}
            onPress={togglePasswordVisibility}
            accessibilityRole={A11yRoles.BUTTON}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityHint="Toggles password visibility"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.toggleText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        )}
      </View>
      {error && (
        <Text
          style={styles.errorText}
          accessibilityRole={A11yRoles.TEXT}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  label: TextStyle;
  inputContainer: ViewStyle;
  inputContainerError: ViewStyle;
  inputContainerDisabled: ViewStyle;
  input: TextStyle;
  toggleButton: ViewStyle;
  toggleText: TextStyle;
  errorText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      marginBottom: theme.spacing.element.stackGap,
    },
    label: {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.element.gap,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface.foreground,
      borderRadius: theme.spacing.input.borderRadius,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      paddingHorizontal: theme.spacing.input.paddingHorizontal,
    },
    inputContainerError: {
      borderColor: theme.colors.status.error,
    },
    inputContainerDisabled: {
      backgroundColor: theme.colors.interactive.disabled,
      opacity: 0.6,
    },
    input: {
      flex: 1,
      paddingVertical: theme.spacing.input.paddingVertical,
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.primary,
    },
    toggleButton: {
      paddingHorizontal: theme.spacing.element.gap,
      paddingVertical: theme.spacing.element.gap,
    },
    toggleText: {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text.link,
    },
    errorText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.status.error,
      marginTop: theme.spacing.element.gap,
    },
  });
}
