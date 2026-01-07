/**
 * @universal/mobile-host
 *
 * Mobile host application that dynamically loads remote components.
 *
 * Uses ScriptManager + Module Federation v2 for dynamic remote loading.
 * Hermes is required for execution.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ScriptManager, Federated } from '@callstack/repack/client';
import {
  ThemeProvider,
  useTheme,
  Theme,
} from '@universal/shared-theme-context';
import {
  I18nProvider,
  useTranslation,
  useLocale,
  locales,
  availableLocales,
  getLocaleDisplayName,
} from '@universal/shared-i18n';
import {
  EventBusProvider,
  useEventBus,
  useEventListener,
  createEventLogger,
  InteractionEventTypes,
  type AppEvents,
  type ButtonPressedEvent,
} from '@universal/shared-event-bus';

// Platform-specific remote host configuration
// Android uses port 9004, iOS uses port 9005 to allow simultaneous testing
// Use a function to ensure Platform is available when called
const getRemoteHost = () => {
  if (Platform && Platform.OS) {
    return Platform.OS === 'android'
      ? // Android emulator → host machine
        'http://10.0.2.2:9004'
      : // iOS simulator → localhost (uses separate port 9005)
        'http://localhost:9005';
  }
  // Fallback: assume iOS if Platform not available (for initial load)
  return 'http://localhost:9005';
};

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  console.log('[ScriptManager resolver]', { scriptId, caller });

  const REMOTE_HOST = getRemoteHost();

  // 1. Main container bundle for the remote
  if (scriptId === 'HelloRemote') {
    const url = `${REMOTE_HOST}/HelloRemote.container.js.bundle`;
    console.log('[ScriptManager resolver] resolved URL for HelloRemote:', url);
    return { url };
  }

  // 2. MF V2 expose chunks (e.g., __federation_expose_HelloRemote)
  // Re.Pack outputs these with .index.bundle extension
  if (scriptId.startsWith('__federation_expose_')) {
    const url = `${REMOTE_HOST}/${scriptId}.index.bundle`;
    console.log(
      '[ScriptManager resolver] resolved URL for federation expose chunk:',
      scriptId,
      url
    );
    return { url };
  }

  // 3. All other chunks requested by HelloRemote container
  // This handles async chunks like vendors-*, src_*, etc.
  // Re.Pack outputs these with .index.bundle extension
  if (caller === 'HelloRemote') {
    const url = `${REMOTE_HOST}/${scriptId}.index.bundle`;
    console.log(
      '[ScriptManager resolver] resolved URL for HelloRemote chunk:',
      scriptId,
      url
    );
    return { url };
  }

  throw new Error(`Unknown scriptId: ${scriptId}`);
});

interface AppState {
  remoteComponent: React.ComponentType<any> | null;
  loading: boolean;
  error: string | null;
  pressCount: number;
}

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
  loadButton: ViewStyle;
  loadButtonText: TextStyle;
  loading: ViewStyle;
  loadingText: TextStyle;
  error: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  remoteContainer: ViewStyle;
  counter: ViewStyle;
  counterText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.background,
    },
    header: {
      padding: theme.spacing.layout.screenPadding,
      paddingTop: 60,
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
    loadButton: {
      backgroundColor: theme.colors.interactive.primary,
      paddingHorizontal: theme.spacing.button.paddingHorizontal,
      paddingVertical: theme.spacing.button.paddingVertical,
      borderRadius: theme.spacing.button.borderRadius,
      marginBottom: theme.spacing.layout.screenPadding,
    },
    loadButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSizes.base,
      fontWeight: theme.typography.fontWeights.semibold,
    },
    loading: {
      alignItems: 'center',
      padding: theme.spacing.layout.screenPadding,
    },
    loadingText: {
      marginTop: theme.spacing.component.gap,
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.tertiary,
    },
    error: {
      alignItems: 'center',
      padding: theme.spacing.layout.screenPadding,
    },
    errorText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.status.error,
      marginBottom: theme.spacing.component.gap,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: theme.colors.status.error,
      paddingHorizontal: theme.spacing.button.paddingHorizontalSmall,
      paddingVertical: theme.spacing.button.paddingVerticalSmall,
      borderRadius: theme.spacing.button.borderRadius,
    },
    retryButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.semibold,
    },
    remoteContainer: {
      width: '100%',
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

// Development mode check for conditional logging
const __DEV__ = process.env.NODE_ENV !== 'production';

/**
 * EventLogger component - enables debug logging in development mode.
 * This subscribes to all events and logs them to the console.
 */
function EventLogger() {
  const bus = useEventBus<AppEvents>();

  useEffect(() => {
    if (!__DEV__) return;

    const unsubscribe = createEventLogger(bus, {
      prefix: '[MobileHost]',
      showTimestamp: true,
      showPayload: true,
      useColors: false, // Mobile console doesn't support CSS colors
    });

    return unsubscribe;
  }, [bus]);

  return null;
}

/**
 * Inner app component that uses theme context.
 */
function AppContent() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [state, setState] = useState<AppState>({
    remoteComponent: null,
    loading: false,
    error: null,
    pressCount: 0,
  });

  // Listen for BUTTON_PRESSED events from remote MFEs
  // This demonstrates event-based communication without prop drilling
  useEventListener<ButtonPressedEvent>(
    InteractionEventTypes.BUTTON_PRESSED,
    (event) => {
      // Update press count when remote button is pressed
      setState((prev) => ({ ...prev, pressCount: prev.pressCount + 1 }));
      console.log(
        `[MobileHost] Received BUTTON_PRESSED from ${event.source}:`,
        event.payload
      );
    }
  );

  // Cycle through available locales
  const cycleLocale = () => {
    const currentIndex = availableLocales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % availableLocales.length;
    setLocale(availableLocales[nextIndex]);
  };

  const loadRemote = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Prefetch the remote bundle (optional but recommended)
      await ScriptManager.shared.prefetchScript('HelloRemote');

      // Dynamically import the remote module using MFv2
      const RemoteModule = await Federated.importModule(
        'HelloRemote',
        './HelloRemote',
        'default'
      );

      // Extract the default export (HelloRemote component)
      const HelloRemote = RemoteModule.default || RemoteModule;

      setState((prev) => ({
        ...prev,
        remoteComponent: HelloRemote,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load remote:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  // Legacy callback - no longer needed since we use event bus
  // Kept for demonstration of backward compatibility
  // The remote still calls onPress, but host now listens via event bus instead
  const handleRemotePress = () => {
    // Note: Press count is now updated by the BUTTON_PRESSED event listener above
    // This callback could be used for additional host-specific logic
    console.log('[MobileHost] Legacy onPress callback triggered');
  };

  const HelloRemote = state.remoteComponent;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('appName')} - Mobile Host</Text>
        </View>
        <View style={styles.controlsRow}>
          <Pressable style={styles.themeToggle} onPress={toggleTheme}>
            <Text style={styles.themeToggleText}>
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </Text>
          </Pressable>
          <Pressable style={styles.langToggle} onPress={cycleLocale}>
            <Text style={styles.langToggleText}>
              🌐 {getLocaleDisplayName(locale)}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          {t('subtitleMobile')}
        </Text>
      </View>

      <View style={styles.content}>
        {!HelloRemote && !state.loading && !state.error && (
          <Pressable style={styles.loadButton} onPress={loadRemote}>
            <Text style={styles.loadButtonText}>{t('loadRemote')}</Text>
          </Pressable>
        )}

        {state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={theme.colors.interactive.primary}
            />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        )}

        {state.error && (
          <View style={styles.error}>
            <Text style={styles.errorText}>{t('error')}: {state.error}</Text>
            <Pressable style={styles.retryButton} onPress={loadRemote}>
              <Text style={styles.retryButtonText}>{t('retry')}</Text>
            </Pressable>
          </View>
        )}

        {HelloRemote && (
          <View style={styles.remoteContainer}>
            <HelloRemote name="Mobile User" onPress={handleRemotePress} locale={locale} />
          </View>
        )}

        {state.pressCount > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {t('pressCount', { count: state.pressCount })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Root React component that wraps the app with EventBusProvider, I18nProvider, and ThemeProvider.
 */
function App() {
  return (
    <EventBusProvider options={{ debug: __DEV__, name: 'MobileHost' }}>
      <I18nProvider translations={locales} initialLocale="en">
        <ThemeProvider>
          <EventLogger />
          <AppContent />
        </ThemeProvider>
      </I18nProvider>
    </EventBusProvider>
  );
}

export default App;