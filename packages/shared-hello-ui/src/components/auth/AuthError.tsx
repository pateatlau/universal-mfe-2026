/**
 * AuthError - Universal authentication error display component
 *
 * Uses React Native primitives for cross-platform compatibility.
 * Displays error messages with dismiss functionality.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { A11yRoles, A11yLabels } from '@universal/shared-a11y';

export interface AuthErrorProps {
  /** Error message to display */
  message: string | null;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * AuthError component for displaying authentication errors.
 *
 * Features:
 * - Accessible error announcements
 * - Optional dismiss button
 * - Themed styling
 */
export function AuthError({
  message,
  onDismiss,
  testID,
}: AuthErrorProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!message) {
    return null;
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      testID={testID}
    >
      <Text style={styles.message} accessibilityRole={A11yRoles.TEXT}>
        {message}
      </Text>
      {onDismiss && (
        <Pressable
          style={styles.dismissButton}
          onPress={onDismiss}
          accessibilityRole={A11yRoles.BUTTON}
          accessibilityLabel={A11yLabels.CLOSE}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  message: TextStyle;
  dismissButton: ViewStyle;
  dismissText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.status.errorBackground,
      borderRadius: theme.spacing.component.borderRadius,
      borderWidth: 1,
      borderColor: theme.colors.status.error,
      padding: theme.spacing.component.paddingSmall,
      marginBottom: theme.spacing.element.stackGap,
    },
    message: {
      flex: 1,
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.status.error,
    },
    dismissButton: {
      padding: theme.spacing.element.gap,
      marginLeft: theme.spacing.element.gap,
    },
    dismissText: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.status.error,
      lineHeight: theme.typography.fontSizes.lg,
    },
  });
}
