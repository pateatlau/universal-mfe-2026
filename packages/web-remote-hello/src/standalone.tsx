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
  type ThemeName,
} from '@universal/shared-theme-context';
import {
  I18nProvider,
  useLocale,
  useTranslation,
  locales,
  availableLocales,
  getLocaleDisplayName,
} from '@universal/shared-i18n';
import HelloRemote from './HelloRemote';

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerRow: ViewStyle;
  controlsRow: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  themeToggle: ViewStyle;
  themeToggleText: TextStyle;
  langToggle: ViewStyle;
  langToggleText: TextStyle;
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
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.element.gap,
      marginBottom: theme.spacing.element.gap,
    },
    title: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
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
    langToggle: {
      backgroundColor: theme.colors.surface.tertiary,
      paddingHorizontal: theme.spacing.component.padding,
      paddingVertical: theme.spacing.element.gap,
      borderRadius: theme.spacing.component.borderRadius,
    },
    langToggleText: {
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
 * Inner standalone app component that uses theme and i18n context.
 */
function StandaloneAppContent() {
  const { theme, isDark, toggleTheme, themeName } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pressCount, setPressCount] = useState(0);

  const handlePress = () => {
    setPressCount((prev) => prev + 1);
    console.info('Remote button pressed!', pressCount + 1);
  };

  // Cycle through available locales
  const cycleLocale = () => {
    const currentIndex = availableLocales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % availableLocales.length;
    setLocale(availableLocales[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Web Remote - Standalone Mode</Text>
        </View>
        <View style={styles.controlsRow}>
          <Pressable style={styles.themeToggle} onPress={toggleTheme}>
            <Text style={styles.themeToggleText}>
              {isDark ? `🌙 ${t('theme.dark')}` : `☀️ ${t('theme.light')}`}
            </Text>
          </Pressable>
          <Pressable style={styles.langToggle} onPress={cycleLocale}>
            <Text style={styles.langToggleText}>
              🌐 {getLocaleDisplayName(locale)}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          Testing remote component in isolation
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.remoteContainer}>
          <HelloRemote name="Web User" onPress={handlePress} locale={locale} theme={themeName} />
        </View>

        {pressCount > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {t('pressCount', { count: pressCount })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Root standalone app component that wraps with I18nProvider and ThemeProvider.
 */
function StandaloneApp() {
  return (
    <I18nProvider translations={locales} initialLocale="en">
      <ThemeProvider>
        <StandaloneAppContent />
      </ThemeProvider>
    </I18nProvider>
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
