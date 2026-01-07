import React, { useEffect, useRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAnnounce } from '../hooks/useAnnounce';
import { A11Y_MIN_TOUCH_TARGET } from '../constants';

/**
 * Props for AccessibleInput component
 */
export interface AccessibleInputProps extends Omit<TextInputProps, 'accessibilityLabel'> {
  /**
   * Label text displayed above the input
   */
  label: string;

  /**
   * Whether to visually hide the label (still accessible to screen readers)
   */
  labelHidden?: boolean;

  /**
   * Accessibility label (defaults to label if not provided)
   */
  accessibilityLabel?: string;

  /**
   * Hint text displayed below the input
   */
  hint?: string;

  /**
   * Error message (displayed and announced when present)
   */
  error?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Custom styles for the container
   */
  containerStyle?: ViewStyle;

  /**
   * Custom styles for the label
   */
  labelStyle?: TextStyle;

  /**
   * Custom styles for the input
   */
  inputStyle?: TextStyle;

  /**
   * Custom styles for the hint text
   */
  hintStyle?: TextStyle;

  /**
   * Custom styles for the error text
   */
  errorStyle?: TextStyle;
}

/**
 * Accessible text input with label, hint, and error support.
 *
 * Features:
 * - Associated label for screen readers
 * - Error announcements when errors appear
 * - Hint text support
 * - Required field indication
 * - Minimum touch target size
 *
 * @example
 * ```tsx
 * // Basic input
 * <AccessibleInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   keyboardType="email-address"
 *   autoComplete="email"
 * />
 *
 * // With error
 * <AccessibleInput
 *   label="Password"
 *   secureTextEntry
 *   error={passwordError}
 *   hint="Must be at least 8 characters"
 *   required
 * />
 *
 * // Hidden label (for search inputs with visible placeholder)
 * <AccessibleInput
 *   label="Search"
 *   labelHidden
 *   placeholder="Search..."
 * />
 * ```
 */
export function AccessibleInput({
  label,
  labelHidden = false,
  accessibilityLabel,
  hint,
  error,
  required = false,
  disabled = false,
  containerStyle,
  labelStyle,
  inputStyle,
  hintStyle,
  errorStyle,
  ...props
}: AccessibleInputProps): React.ReactElement {
  const { announceAssertive } = useAnnounce();
  const prevErrorRef = useRef<string | undefined>(undefined);

  // Announce errors when they appear
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      announceAssertive(`Error: ${error}`);
    }
    prevErrorRef.current = error;
  }, [error, announceAssertive]);

  // Build accessibility label
  const buildAccessibilityLabel = (): string => {
    const parts: string[] = [accessibilityLabel ?? label];

    if (required) {
      parts.push('required');
    }

    if (error) {
      parts.push(`Error: ${error}`);
    } else if (hint) {
      parts.push(hint);
    }

    return parts.join(', ');
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <Text
        style={[
          styles.label,
          labelStyle,
          labelHidden && styles.visuallyHidden,
          disabled && styles.disabledText,
        ]}
        accessibilityRole="text"
      >
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Input */}
      <TextInput
        {...props}
        style={[
          styles.input,
          inputStyle,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        accessibilityLabel={buildAccessibilityLabel()}
        accessibilityState={{
          disabled,
        }}
        editable={!disabled}
        aria-required={required}
        aria-invalid={!!error}
      />

      {/* Hint */}
      {hint && !error && (
        <Text
          style={[styles.hint, hintStyle, disabled && styles.disabledText]}
          accessibilityRole="text"
        >
          {hint}
        </Text>
      )}

      {/* Error */}
      {error && (
        <Text
          style={[styles.error, errorStyle]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    minHeight: A11Y_MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc2626',
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    fontWeight: '500',
  },
  disabledText: {
    opacity: 0.5,
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    // clip is deprecated but still needed for some browsers
    // clipPath is the modern replacement
  },
});

export default AccessibleInput;
