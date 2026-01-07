/**
 * @universal/mobile-remote-hello
 *
 * Mobile remote component exposed via Module Federation v2.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered natively in React Native on mobile platforms.
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

import React, { useCallback } from 'react';
import { HelloUniversal } from '@universal/shared-hello-ui';
import { ThemeProvider } from '@universal/shared-theme-context';
import { I18nProvider, locales, type LocaleCode } from '@universal/shared-i18n';
import {
  EventBusProvider,
  useEventBus,
  InteractionEventTypes,
  type AppEvents,
} from '@universal/shared-event-bus';
import { useHelloLocalStore } from './store/localStore';

export interface HelloRemoteProps {
  name?: string;
  onPress?: () => void;
  /** Locale passed from host for i18n synchronization */
  locale?: LocaleCode;
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
          remoteName: 'mobile-remote-hello',
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
 * HelloRemote - Mobile remote component exposed via MFv2
 *
 * Wraps HelloUniversal with providers since remote modules load as separate
 * bundles and don't inherit context from the host.
 *
 * Provider order:
 * 1. EventBusProvider - For emitting events to the host
 * 2. I18nProvider - For translations
 * 3. ThemeProvider - For theming
 *
 * The locale prop allows the host to pass its current locale so the remote
 * can display translations in the same language as the host.
 */
export default function HelloRemote({ name, onPress, locale = 'en' }: HelloRemoteProps) {
  // Use key to force I18nProvider re-mount when locale changes from host
  return (
    <EventBusProvider options={{ name: 'HelloRemote' }}>
      <I18nProvider key={locale} translations={locales} initialLocale={locale}>
        <ThemeProvider>
          <HelloRemoteInner name={name} onPress={onPress} />
        </ThemeProvider>
      </I18nProvider>
    </EventBusProvider>
  );
}
