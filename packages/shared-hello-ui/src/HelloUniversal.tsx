/**
 * @universal/shared-hello-ui
 *
 * Universal React Native UI component with theme support, accessibility, and i18n.
 *
 * Constraints:
 * - MUST use React Native primitives only (View, Text, Pressable, etc.)
 * - NO DOM elements (<div>, <span>, <button>, etc.)
 * - NO platform-specific code (except Platform.select)
 * - NO host-specific dependencies
 * - Uses theme tokens from @universal/shared-theme-context
 * - Uses accessibility utilities from @universal/shared-a11y
 * - Uses translations from @universal/shared-i18n
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { A11yRoles, A11yLabels, A11Y_MIN_TOUCH_TARGET } from '@universal/shared-a11y';
import { useTranslation } from '@universal/shared-i18n';

export interface HelloUniversalProps {
  /** Name to display in the greeting */
  name?: string;
  /** Callback when the button is pressed */
  onPress?: () => void;
  /** Custom accessibility label for the button (defaults to "Press Me") */
  buttonAccessibilityLabel?: string;
  /** Accessibility hint describing what the button does */
  buttonAccessibilityHint?: string;
}

/**
 * Universal Hello component using React Native primitives and theme tokens.
 *
 * This component can be rendered:
 * - On web via React Native Web (RNW)
 * - On mobile via React Native (RN)
 *
 * Uses only RN primitives: View, Text, Pressable
 * Supports light/dark themes via ThemeProvider
 * Includes full accessibility support for screen readers
 */
export function HelloUniversal({
  name,
  onPress,
  buttonAccessibilityLabel,
  buttonAccessibilityHint,
}: HelloUniversalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation('hello');
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Use translated greeting with name interpolation
  const greeting = name
    ? t('greetingWithName', { params: { name } })
    : t('greeting');

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`Greeting card: ${greeting}`}
    >
      <Text
        style={styles.text}
        accessibilityRole={A11yRoles.TEXT}
      >
        {greeting}
      </Text>
      {onPress && (
        <Pressable
          style={styles.button}
          onPress={onPress}
          accessibilityRole={A11yRoles.BUTTON}
          accessibilityLabel={buttonAccessibilityLabel ?? t('buttonLabel')}
          accessibilityHint={buttonAccessibilityHint ?? t('buttonHint')}
        >
          <Text style={styles.buttonText}>{t('buttonLabel')}</Text>
        </Pressable>
      )}
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  text: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      padding: theme.spacing.component.padding,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.card,
      borderRadius: 8,
    },
    text: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold,
      marginBottom: theme.spacing.element.stackGap,
      color: theme.colors.text.primary,
    },
    button: {
      backgroundColor: theme.colors.interactive.primary,
      paddingHorizontal: theme.spacing.button.paddingHorizontal,
      paddingVertical: theme.spacing.button.paddingVertical,
      borderRadius: 8,
      minHeight: A11Y_MIN_TOUCH_TARGET,
      minWidth: A11Y_MIN_TOUCH_TARGET,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSizes.base,
      fontWeight: theme.typography.fontWeights.medium,
    },
  });
}

