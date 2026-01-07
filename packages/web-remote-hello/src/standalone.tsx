/**
 * @universal/web-remote-hello
 *
 * Standalone entry point for the remote.
 * This allows the remote to run independently for development/testing.
 *
 * Displays the same component that is shared to the shell, providing
 * a consistent experience for testing the remote in isolation.
 */

import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  ThemeProvider,
  useTheme,
  Theme,
} from '@universal/shared-theme-context';
import HelloRemote from './HelloRemote';

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerRow: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  themeToggle: ViewStyle;
  themeToggleText: TextStyle;
  content: ViewStyle;
  remoteContainer: ViewStyle;
  counter: ViewStyle;
  counterText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      width: '100%' as unknown as number,
      minHeight: '100vh' as unknown as number,
      backgroundColor: theme.colors.surface.background,
    },
    header: {
      padding: theme.spacing.layout.screenPadding,
      backgroundColor: theme.colors.surface.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      alignItems: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginBottom: theme.spacing.element.gap,
    },
    title: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      marginRight: theme.spacing.element.gap,
    },
    subtitle: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    themeToggle: {
      backgroundColor: theme.colors.surface.tertiary,
      paddingHorizontal: theme.spacing.component.padding,
      paddingVertical: theme.spacing.element.gap,
      borderRadius: theme.spacing.component.borderRadius,
    },
    themeToggleText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    content: {
      flex: 1,
      padding: theme.spacing.layout.screenPadding,
      alignItems: 'center',
      justifyContent: 'center',
    },
    remoteContainer: {
      width: '100%' as unknown as number,
      alignItems: 'center',
    },
    counter: {
      marginTop: theme.spacing.layout.screenPadding,
      padding: theme.spacing.component.padding,
      backgroundColor: theme.colors.surface.tertiary,
      borderRadius: theme.spacing.component.borderRadius,
    },
    counterText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.interactive.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
  });
}

/**
 * Inner standalone app component that uses theme context.
 */
function StandaloneAppContent() {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pressCount, setPressCount] = useState(0);

  const handlePress = () => {
    setPressCount((prev) => prev + 1);
    console.info('Remote button pressed!', pressCount + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Web Remote - Standalone Mode</Text>
          <Pressable style={styles.themeToggle} onPress={toggleTheme}>
            <Text style={styles.themeToggleText}>
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          Testing remote component in isolation
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.remoteContainer}>
          <HelloRemote name="Web User" onPress={handlePress} />
        </View>

        {pressCount > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              Remote button pressed {pressCount} time
              {pressCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Root standalone app component that wraps with ThemeProvider.
 */
function StandaloneApp() {
  return (
    <ThemeProvider>
      <StandaloneAppContent />
    </ThemeProvider>
  );
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <StandaloneApp />
  </React.StrictMode>
);
