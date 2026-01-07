/**
 * @universal/mobile-remote-hello
 *
 * Mobile remote component exposed via Module Federation v2.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered natively in React Native on mobile platforms.
 *
 * ## Event Bus Integration
 *
 * This remote demonstrates inter-MFE communication via the event bus:
 * - Emits `BUTTON_PRESSED` event when the button is clicked
 * - Host receives the event and can react (e.g., update state, analytics)
 * - Still supports `onPress` callback for backward compatibility
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

export interface HelloRemoteProps {
  name?: string;
  onPress?: () => void;
  /** Locale passed from host for i18n synchronization */
  locale?: LocaleCode;
}

/**
 * Inner component that has access to event bus context.
 */
function HelloRemoteInner({ name, onPress }: Omit<HelloRemoteProps, 'locale'>) {
  const bus = useEventBus<AppEvents>();

  const handlePress = useCallback(() => {
    // Emit event via event bus for inter-MFE communication
    bus.emit(
      InteractionEventTypes.BUTTON_PRESSED,
      {
        buttonId: 'hello-remote-press-me',
        label: 'Press Me',
        metadata: { remoteName: 'mobile-remote-hello', userName: name },
      },
      1, // version
      { source: 'HelloRemote' }
    );

    // Also call the legacy callback for backward compatibility
    onPress?.();
  }, [bus, name, onPress]);

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
