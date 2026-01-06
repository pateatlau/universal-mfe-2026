/**
 * @universal/shared-hello-ui
 *
 * Universal React Native UI component with theme support.
 *
 * Constraints:
 * - MUST use React Native primitives only (View, Text, Pressable, etc.)
 * - NO DOM elements (<div>, <span>, <button>, etc.)
 * - NO platform-specific code (except Platform.select)
 * - NO host-specific dependencies
 * - Can import from @universal/shared-utils
 * - Uses theme tokens from @universal/shared-theme-context
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { getGreeting } from '@universal/shared-utils';
import { useTheme, Theme } from '@universal/shared-theme-context';

export interface HelloUniversalProps {
  name?: string;
  onPress?: () => void;
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
 */
export function HelloUniversal({ name, onPress }: HelloUniversalProps) {
  const { theme } = useTheme();
  const greeting = getGreeting(name);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{greeting}</Text>
      {onPress && (
        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Press Me</Text>
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
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSizes.base,
      fontWeight: theme.typography.fontWeights.medium,
    },
  });
}

