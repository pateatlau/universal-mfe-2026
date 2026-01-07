/**
 * @universal/web-shell
 *
 * Web shell application that dynamically loads remote components.
 *
 * Uses React Native Web to render universal RN components.
 * Uses manual loading pattern with error handling for consistency with mobile.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
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

// Enable event logging in development
const __DEV__ = process.env.NODE_ENV !== 'production';

interface AppState {
  remoteComponent: React.ComponentType<any> | null;
  loading: boolean;
  error: string | null;
  pressCount: number;
  loadAttempt: number; // Track load attempts for cache busting
  requiresReload: boolean; // True when MF cached a failed load and requires page reload
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
      width: '100%',
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

/**
 * Component that enables event logging in development mode.
 */
function EventLogger() {
  const bus = useEventBus<AppEvents>();

  useEffect(() => {
    if (__DEV__) {
      const unsubscribe = createEventLogger(bus, {
        prefix: '[WebShell]',
        showTimestamp: true,
        showPayload: true,
      });
      return unsubscribe;
    }
  }, [bus]);

  return null;
}

/**
 * Inner app component that uses theme and i18n context.
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
    loadAttempt: 0,
    requiresReload: false,
  });

  // Listen for BUTTON_PRESSED events from remote MFEs
  // This demonstrates event-based communication without prop drilling
  useEventListener<ButtonPressedEvent>(
    InteractionEventTypes.BUTTON_PRESSED,
    (event) => {
      // Update press count when remote button is pressed
      setState((prev) => ({ ...prev, pressCount: prev.pressCount + 1 }));
      console.info(
        `[WebShell] Received BUTTON_PRESSED from ${event.source}:`,
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
    // Reset component and increment attempt counter on retry
    setState((prev) => ({
      ...prev,
      remoteComponent: null,
      loading: true,
      error: null,
      loadAttempt: prev.loadAttempt + 1,
      requiresReload: false,
    }));

    try {
      // Dynamic import - Module Federation handles caching
      const RemoteModule = await import('hello_remote/HelloRemote');
      const HelloRemote = RemoteModule.default;

      // Validate that we got a valid React component (must be a function)
      // Module Federation caches failed loads as empty objects, so we need to detect this
      if (typeof HelloRemote !== 'function') {
        // MF cached a failed load - need page reload to retry properly
        setState((prev) => ({
          ...prev,
          remoteComponent: null,
          loading: false,
          error: 'Remote module is not available. Please ensure the remote server is running and reload the page.',
          requiresReload: true,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        remoteComponent: HelloRemote,
        loading: false,
      }));
    } catch (error) {
      // Log the original error for debugging
      console.error('Failed to load remote:', error);

      // Show user-friendly error message
      // Module Federation errors are technical - translate to user-friendly message
      setState((prev) => ({
        ...prev,
        remoteComponent: null,
        loading: false,
        error: 'Unable to load remote component. The remote server may be unavailable. Please check that it is running and reload the page.',
        requiresReload: true, // Always require reload since MF caches failures
      }));
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  // Legacy callback - no longer needed since we use event bus
  // Kept for demonstration of backward compatibility
  // The remote still calls onPress, but host now listens via event bus instead
  const handleRemotePress = () => {
    // Note: Press count is now updated by the BUTTON_PRESSED event listener above
    // This callback could be used for additional host-specific logic
    console.info('[WebShell] Legacy onPress callback triggered');
  };

  const HelloRemote = state.remoteComponent;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('appName')} - Web Shell</Text>
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
          {t('subtitle')}
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
            <Text style={styles.errorText}>{state.error}</Text>
            <Pressable style={styles.retryButton} onPress={reloadPage}>
              <Text style={styles.retryButtonText}>Reload Page</Text>
            </Pressable>
          </View>
        )}

        {HelloRemote && (
          <View style={styles.remoteContainer} key={`remote-${state.loadAttempt}`}>
            <HelloRemote name="Web User" onPress={handleRemotePress} locale={locale} />
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
 * Root React component that wraps the app with providers.
 * Provider order (outermost to innermost):
 * 1. EventBusProvider - Event bus for inter-MFE communication
 * 2. I18nProvider - Internationalization
 * 3. ThemeProvider - Theming
 */
function App() {
  return (
    <EventBusProvider options={{ debug: __DEV__, name: 'WebShell' }}>
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