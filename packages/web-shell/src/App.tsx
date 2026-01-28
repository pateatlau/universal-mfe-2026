/**
 * @universal/web-shell
 *
 * Web shell application with routing and dynamic remote loading.
 *
 * Uses React Native Web to render universal RN components.
 * Uses React Router for navigation between pages.
 */

import React, { useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BrowserRouter, Routes as RouterRoutes, Route, Link, Navigate } from 'react-router-dom';
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
  createEventLogger,
  ThemeEventTypes,
  LocaleEventTypes,
  AuthEventTypes,
  type AppEvents,
  type AuthEvents,
} from '@universal/shared-event-bus';
import { QueryProvider } from '@universal/shared-data-layer';
import { Routes } from '@universal/shared-router';
import {
  configureStorage,
  createWebStorage,
  isStorageConfigured,
} from '@universal/shared-utils';
import {
  configureAuthService,
  configureAuthEventEmitter,
  useAuthStore,
} from '@universal/shared-auth-store';
import { firebaseAuthService } from './services/firebaseAuthService';

// Pages
import { Home } from './pages/Home';
import { Remote } from './pages/Remote';
import { Settings } from './pages/Settings';

// Enable event logging in development
const __DEV__ = process.env.NODE_ENV !== 'production';

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerRow: ViewStyle;
  controlsRow: ViewStyle;
  title: TextStyle;
  titleLink: ViewStyle;
  subtitle: TextStyle;
  themeToggle: ViewStyle;
  themeToggleText: TextStyle;
  langToggle: ViewStyle;
  langToggleText: TextStyle;
  navLink: ViewStyle;
  navLinkText: TextStyle;
  content: ViewStyle;
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
    titleLink: {
      // Style for the clickable title
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
    navLink: {
      backgroundColor: theme.colors.surface.tertiary,
      paddingHorizontal: theme.spacing.component.padding,
      paddingVertical: theme.spacing.element.gap,
      borderRadius: theme.spacing.component.borderRadius,
    },
    navLinkText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.interactive.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    content: {
      flex: 1,
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
 * Component that initializes Firebase authentication.
 *
 * Configures:
 * - Storage adapter (localStorage for web)
 * - Auth service (Firebase)
 * - Event emitter for cross-MFE auth sync
 *
 * Must be rendered inside EventBusProvider.
 */
function AuthInitializer() {
  const bus = useEventBus<AuthEvents>();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isConfigured = useRef(false);

  useEffect(() => {
    // Only configure once
    if (isConfigured.current) {
      return;
    }

    // Configure storage with web localStorage
    if (!isStorageConfigured()) {
      configureStorage(createWebStorage(window.localStorage));
    }

    // Configure auth service with Firebase
    configureAuthService(firebaseAuthService);

    // Configure event emitter for cross-MFE auth sync
    configureAuthEventEmitter((type, payload) => {
      // Map auth events to event bus
      switch (type) {
        case 'USER_LOGGED_IN':
          bus.emit(
            AuthEventTypes.USER_LOGGED_IN,
            {
              userId: payload.userId as string,
              email: payload.email as string | undefined,
              displayName: payload.displayName as string | undefined,
            },
            1,
            { source: 'WebShell' }
          );
          break;
        case 'USER_LOGGED_OUT':
          bus.emit(
            AuthEventTypes.USER_LOGGED_OUT,
            { reason: payload.reason as 'user_initiated' | 'session_expired' | 'forced' | 'error' },
            1,
            { source: 'WebShell' }
          );
          break;
        case 'AUTH_ERROR':
          bus.emit(
            AuthEventTypes.AUTH_ERROR,
            {
              code: payload.code as string,
              message: payload.message as string,
            },
            1,
            { source: 'WebShell' }
          );
          break;
        default:
          if (__DEV__) {
            console.log(`[WebShell] Unhandled auth event: ${type}`, payload);
          }
      }
    });

    isConfigured.current = true;

    // Initialize auth and subscribe to state changes
    let unsubscribe: (() => void) | undefined;

    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
      if (__DEV__) {
        console.log('[WebShell] Auth initialized');
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [bus, initializeAuth]);

  return null;
}

/**
 * Header component with navigation and controls.
 */
function Header() {
  const { theme, isDark, toggleTheme, themeName } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bus = useEventBus<AppEvents>();

  const handleThemeToggle = useCallback(() => {
    const previousTheme = themeName;
    toggleTheme();
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    bus.emit(
      ThemeEventTypes.THEME_CHANGED,
      { theme: newTheme, previousTheme },
      1,
      { source: 'WebShell' }
    );
  }, [bus, themeName, toggleTheme]);

  const handleLocaleChange = useCallback(
    (newLocale: string) => {
      const previousLocale = locale;
      setLocale(newLocale as typeof locale);
      bus.emit(
        LocaleEventTypes.LOCALE_CHANGED,
        { locale: newLocale, previousLocale },
        1,
        { source: 'WebShell' }
      );
    },
    [bus, locale, setLocale]
  );

  const cycleLocale = useCallback(() => {
    const currentIndex = availableLocales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % availableLocales.length;
    handleLocaleChange(availableLocales[nextIndex]);
  }, [locale, handleLocaleChange]);

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Pressable style={styles.titleLink}>
            <Text style={styles.title}>{t('appName')} - Web Shell</Text>
          </Pressable>
        </Link>
      </View>
      <View style={styles.controlsRow}>
        <Pressable style={styles.themeToggle} onPress={handleThemeToggle}>
          <Text style={styles.themeToggleText}>
            {isDark ? `🌙 ${t('theme.dark')}` : `☀️ ${t('theme.light')}`}
          </Text>
        </Pressable>
        <Pressable style={styles.langToggle} onPress={cycleLocale}>
          <Text style={styles.langToggleText}>
            🌐 {getLocaleDisplayName(locale)}
          </Text>
        </Pressable>
        <Link to={`/${Routes.SETTINGS}`} style={{ textDecoration: 'none' }}>
          <Pressable style={styles.navLink}>
            <Text style={styles.navLinkText}>⚙️</Text>
          </Pressable>
        </Link>
      </View>
      <Text style={styles.subtitle}>{t('subtitle')}</Text>
    </View>
  );
}

/**
 * Main layout component with header and routed content.
 */
function AppLayout() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <RouterRoutes>
          {/* Redirect root to canonical /home route */}
          <Route path="/" element={<Navigate to={`/${Routes.HOME}`} replace />} />
          <Route path={`/${Routes.HOME}`} element={<Home />} />
          <Route path={`/${Routes.REMOTE_HELLO}`} element={<Remote />} />
          <Route path={`/${Routes.SETTINGS}`} element={<Settings />} />
        </RouterRoutes>
      </View>
    </View>
  );
}

/**
 * Root React component that wraps the app with providers.
 * Provider order (outermost to innermost):
 * 1. BrowserRouter - Web routing
 * 2. QueryProvider - Data fetching (React Query)
 * 3. EventBusProvider - Event bus for inter-MFE communication
 * 4. I18nProvider - Internationalization
 * 5. ThemeProvider - Theming
 *
 * AuthInitializer configures Firebase auth and emits events to the bus.
 */
function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <EventBusProvider options={{ debug: __DEV__, name: 'WebShell' }}>
          <I18nProvider translations={locales} initialLocale="en">
            <ThemeProvider>
              <EventLogger />
              <AuthInitializer />
              <AppLayout />
            </ThemeProvider>
          </I18nProvider>
        </EventBusProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}

export default App;
