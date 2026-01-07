/**
 * @universal/web-remote-hello
 *
 * Web remote component exposed via Module Federation.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered via React Native Web on the web platform.
 *
 * ## MFE State Pattern
 *
 * This remote demonstrates the recommended MFE state pattern:
 *
 * 1. **Local State (Zustand)**: Each MFE owns its local state
 *    - Press count, preferences, etc. are MFE-local
 *    - State mutations happen within the MFE
 *    - No direct state sharing with host/other MFEs
 *
 * 2. **Inter-MFE Communication (Event Bus)**: Events notify other MFEs
 *    - Emits `BUTTON_PRESSED` event when the button is clicked
 *    - Host receives the event and can react (e.g., update its own state)
 *    - Events carry information, not state references
 *
 * 3. **Backward Compatibility**: Still supports `onPress` callback
 */

import React, { useCallback, useState, useEffect } from 'react';
import { HelloUniversal } from '@universal/shared-hello-ui';
import { ThemeProvider, type ThemeName } from '@universal/shared-theme-context';
import { I18nProvider, locales, type LocaleCode } from '@universal/shared-i18n';
import {
  EventBusProvider,
  useEventBus,
  useEventListener,
  InteractionEventTypes,
  ThemeEventTypes,
  LocaleEventTypes,
  type AppEvents,
  type ThemeChangedEvent,
  type LocaleChangedEvent,
} from '@universal/shared-event-bus';
import { useHelloLocalStore } from './store/localStore';

export interface HelloRemoteProps {
  name?: string;
  onPress?: () => void;
  /** Initial locale (deprecated: use event bus sync instead) */
  locale?: LocaleCode;
  /** Initial theme (deprecated: use event bus sync instead) */
  theme?: ThemeName;
}

/**
 * Inner component that has access to event bus and local store.
 *
 * Pattern demonstrated:
 * 1. Button press → Update local state (Zustand)
 * 2. Then → Emit event (Event Bus) for cross-MFE communication
 * 3. Then → Call legacy callback (backward compatibility)
 */
function HelloRemoteInner({ name, onPress }: Omit<HelloRemoteProps, 'locale'>) {
  const bus = useEventBus<AppEvents>();
  const incrementPressCount = useHelloLocalStore(
    (state) => state.incrementPressCount
  );
  const localPressCount = useHelloLocalStore((state) => state.localPressCount);

  const handlePress = useCallback(() => {
    // 1. Update local state first (MFE owns its state)
    incrementPressCount();

    // 2. Emit event via event bus for inter-MFE communication
    // Include local press count in metadata so host can see MFE-local stats
    bus.emit(
      InteractionEventTypes.BUTTON_PRESSED,
      {
        buttonId: 'hello-remote-press-me',
        label: 'Press Me',
        metadata: {
          remoteName: 'web-remote-hello',
          userName: name,
          localPressCount: localPressCount + 1, // +1 because state hasn't updated yet
        },
      },
      1, // version
      { source: 'HelloRemote' }
    );

    // 3. Call legacy callback for backward compatibility
    onPress?.();
  }, [bus, name, onPress, incrementPressCount, localPressCount]);

  return <HelloUniversal name={name} onPress={handlePress} />;
}

/**
 * Wrapper component that listens for theme/locale events from host.
 *
 * This enables event-based synchronization instead of prop drilling.
 */
function EventSyncWrapper({
  children,
  initialTheme,
  initialLocale,
  onThemeChange,
  onLocaleChange,
}: {
  children: React.ReactNode;
  initialTheme: ThemeName;
  initialLocale: LocaleCode;
  onThemeChange: (theme: ThemeName) => void;
  onLocaleChange: (locale: LocaleCode) => void;
}) {
  // Listen for THEME_CHANGED events from host
  useEventListener<ThemeChangedEvent>(
    ThemeEventTypes.THEME_CHANGED,
    (event) => {
      console.info('[HelloRemote] Received THEME_CHANGED:', event.payload.theme);
      onThemeChange(event.payload.theme as ThemeName);
    }
  );

  // Listen for LOCALE_CHANGED events from host
  useEventListener<LocaleChangedEvent>(
    LocaleEventTypes.LOCALE_CHANGED,
    (event) => {
      console.info('[HelloRemote] Received LOCALE_CHANGED:', event.payload.locale);
      onLocaleChange(event.payload.locale as LocaleCode);
    }
  );

  return <>{children}</>;
}

/**
 * HelloRemote - Web remote component exposed via MF
 *
 * Wraps HelloUniversal with providers since remote modules load as separate
 * bundles and don't inherit context from the host.
 *
 * Provider order:
 * 1. EventBusProvider - For event bus communication with host
 * 2. EventSyncWrapper - Listens for theme/locale changes from host
 * 3. I18nProvider - For translations (synced via events)
 * 4. ThemeProvider - For theming (synced via events)
 *
 * Theme and locale sync via Event Bus:
 * - Host emits THEME_CHANGED when theme changes
 * - Host emits LOCALE_CHANGED when locale changes
 * - This component listens and updates its providers accordingly
 */
export default function HelloRemote({
  name,
  onPress,
  locale: initialLocale = 'en',
  theme: initialTheme = 'light',
}: HelloRemoteProps) {
  // Local state for theme and locale - updated via event bus OR prop changes
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(initialTheme);
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>(initialLocale);

  // Sync state when props change (for standalone mode where props are passed directly)
  useEffect(() => {
    setCurrentTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    setCurrentLocale(initialLocale);
  }, [initialLocale]);

  return (
    <EventBusProvider options={{ name: 'HelloRemote' }}>
      <EventSyncWrapper
        initialTheme={initialTheme}
        initialLocale={initialLocale}
        onThemeChange={setCurrentTheme}
        onLocaleChange={setCurrentLocale}
      >
        <I18nProvider
          key={currentLocale}
          translations={locales}
          initialLocale={currentLocale}
        >
          <ThemeProvider defaultTheme={currentTheme} key={currentTheme}>
            <HelloRemoteInner name={name} onPress={onPress} />
          </ThemeProvider>
        </I18nProvider>
      </EventSyncWrapper>
    </EventBusProvider>
  );
}

