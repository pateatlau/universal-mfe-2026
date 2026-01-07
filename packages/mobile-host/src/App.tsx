/**
 * @universal/mobile-host
 *
 * Mobile host application that dynamically loads remote components.
 *
 * Uses ScriptManager + Module Federation v2 for dynamic remote loading.
 * Hermes is required for execution.
 */

import React, { useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { NativeRouter, Routes as RouterRoutes, Route, Link } from 'react-router-native';
import { ScriptManager } from '@callstack/repack/client';
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
  type AppEvents,
} from '@universal/shared-event-bus';
import { QueryProvider } from '@universal/shared-data-layer';
import { Routes } from '@universal/shared-router';

// Page components
import Home from './pages/Home';
import Remote from './pages/Remote';
import Settings from './pages/Settings';

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

interface HeaderStyles {
  header: ViewStyle;
  headerRow: ViewStyle;
  controlsRow: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  themeToggle: ViewStyle;
  themeToggleText: TextStyle;
  langToggle: ViewStyle;
  langToggleText: TextStyle;
  navRow: ViewStyle;
  navLink: ViewStyle;
  navLinkText: TextStyle;
  navLinkActive: ViewStyle;
  navLinkTextActive: TextStyle;
}

function createHeaderStyles(theme: Theme): HeaderStyles {
  return StyleSheet.create<HeaderStyles>({
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
      marginBottom: theme.spacing.element.gap,
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
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.element.gap,
    },
    navLink: {
      paddingHorizontal: theme.spacing.component.padding,
      paddingVertical: theme.spacing.element.gap,
    },
    navLinkText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
    },
    navLinkActive: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.interactive.primary,
    },
    navLinkTextActive: {
      color: theme.colors.interactive.primary,
      fontWeight: theme.typography.fontWeights.semibold,
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
 * Header component with navigation and controls.
 */
function Header() {
  const { theme, isDark, toggleTheme, themeName } = useTheme();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('common');
  const styles = useMemo(() => createHeaderStyles(theme), [theme]);
  const bus = useEventBus<AppEvents>();

  // Emit THEME_CHANGED event when theme changes
  const handleThemeToggle = useCallback(() => {
    const previousTheme = themeName;
    toggleTheme();
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    bus.emit(
      ThemeEventTypes.THEME_CHANGED,
      {
        theme: newTheme,
        previousTheme,
      },
      1,
      { source: 'MobileHost' }
    );
  }, [bus, themeName, toggleTheme]);

  // Emit LOCALE_CHANGED event when locale changes
  const handleLocaleChange = useCallback(
    (newLocale: string) => {
      const previousLocale = locale;
      setLocale(newLocale as typeof locale);
      bus.emit(
        LocaleEventTypes.LOCALE_CHANGED,
        {
          locale: newLocale,
          previousLocale,
        },
        1,
        { source: 'MobileHost' }
      );
    },
    [bus, locale, setLocale]
  );

  // Cycle through available locales
  const cycleLocale = useCallback(() => {
    const currentIndex = availableLocales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % availableLocales.length;
    handleLocaleChange(availableLocales[nextIndex]);
  }, [locale, handleLocaleChange]);

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('appName')} - Mobile</Text>
      </View>
      <View style={styles.controlsRow}>
        <Pressable style={styles.themeToggle} onPress={handleThemeToggle}>
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
      <Text style={styles.subtitle}>{t('subtitleMobile')}</Text>
      <View style={styles.navRow}>
        <Link to={`/${Routes.HOME}`} underlayColor="transparent">
          <View style={styles.navLink}>
            <Text style={styles.navLinkText}>{t('navigation.home')}</Text>
          </View>
        </Link>
        <Link to={`/${Routes.REMOTE_HELLO}`} underlayColor="transparent">
          <View style={styles.navLink}>
            <Text style={styles.navLinkText}>{t('navigation.remoteHello')}</Text>
          </View>
        </Link>
        <Link to={`/${Routes.SETTINGS}`} underlayColor="transparent">
          <View style={styles.navLink}>
            <Text style={styles.navLinkText}>{t('navigation.settings')}</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

/**
 * App layout with header and routes.
 */
function AppLayout() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface.background }}>
      <Header />
      <RouterRoutes>
        <Route path="/" element={<Home />} />
        <Route path={`/${Routes.HOME}`} element={<Home />} />
        <Route path={`/${Routes.REMOTE_HELLO}`} element={<Remote />} />
        <Route path={`/${Routes.SETTINGS}`} element={<Settings />} />
      </RouterRoutes>
    </View>
  );
}

/**
 * Root React component that wraps the app with providers.
 * Provider order (outermost to innermost):
 * 1. NativeRouter - Client-side routing
 * 2. QueryProvider - Data fetching (React Query)
 * 3. EventBusProvider - Event bus for inter-MFE communication
 * 4. I18nProvider - Internationalization
 * 5. ThemeProvider - Theming
 */
function App() {
  return (
    <NativeRouter>
      <QueryProvider>
        <EventBusProvider options={{ debug: __DEV__, name: 'MobileHost' }}>
          <I18nProvider translations={locales} initialLocale="en">
            <ThemeProvider>
              <EventLogger />
              <AppLayout />
            </ThemeProvider>
          </I18nProvider>
        </EventBusProvider>
      </QueryProvider>
    </NativeRouter>
  );
}

export default App;
