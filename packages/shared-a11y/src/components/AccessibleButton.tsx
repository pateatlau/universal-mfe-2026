import React from 'react';
import {
  Pressable,
  PressableProps,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityState,
} from 'react-native';
import { A11Y_MIN_TOUCH_TARGET } from '../constants';

/**
 * Props for AccessibleButton component
 */
export interface AccessibleButtonProps extends Omit<PressableProps, 'children'> {
  /**
   * Button label text
   */
  label: string;

  /**
   * Accessibility label (defaults to label if not provided)
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint describing what happens when pressed
   */
  accessibilityHint?: string;

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Whether the button is in a loading/busy state
   */
  loading?: boolean;

  /**
   * Loading text to announce (defaults to "Loading")
   */
  loadingLabel?: string;

  /**
   * Whether this button is currently selected (for toggle buttons)
   */
  selected?: boolean;

  /**
   * Custom styles for the button container
   */
  style?: ViewStyle;

  /**
   * Custom styles for the button text
   */
  textStyle?: TextStyle;

  /**
   * Children to render instead of text label (for custom content)
   */
  children?: React.ReactNode;
}

/**
 * Accessible button component with proper a11y attributes.
 *
 * Features:
 * - Minimum 44x44 touch target (WCAG 2.1 AA)
 * - Proper disabled and loading states
 * - Screen reader announcements for state changes
 * - Selected state for toggle buttons
 *
 * @example
 * ```tsx
 * // Basic button
 * <AccessibleButton
 *   label="Submit"
 *   onPress={handleSubmit}
 *   accessibilityHint="Submits the form"
 * />
 *
 * // Loading state
 * <AccessibleButton
 *   label="Save"
 *   loading={isSaving}
 *   loadingLabel="Saving your changes"
 *   onPress={handleSave}
 * />
 *
 * // Toggle button
 * <AccessibleButton
 *   label={isFavorite ? "Remove from favorites" : "Add to favorites"}
 *   selected={isFavorite}
 *   onPress={toggleFavorite}
 * />
 * ```
 */
export function AccessibleButton({
  label,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  loading = false,
  loadingLabel = 'Loading',
  selected,
  style,
  textStyle,
  children,
  ...props
}: AccessibleButtonProps): React.ReactElement {
  // Build accessibility state
  const accessibilityState: AccessibilityState = {
    disabled: disabled || loading,
    busy: loading,
  };

  // Add selected state if provided (for toggle buttons)
  if (selected !== undefined) {
    accessibilityState.selected = selected;
  }

  // Determine the label to announce
  const effectiveLabel = loading ? loadingLabel : (accessibilityLabel ?? label);

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={effectiveLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      disabled={disabled || loading}
      style={[styles.button, style, (disabled || loading) && styles.disabled]}
    >
      {children ?? (
        <Text style={[styles.text, textStyle, (disabled || loading) && styles.disabledText]}>
          {loading ? loadingLabel : label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: A11Y_MIN_TOUCH_TARGET,
    minWidth: A11Y_MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    // Inherits opacity from parent
  },
});

export default AccessibleButton;
