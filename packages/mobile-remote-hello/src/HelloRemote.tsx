/**
 * @universal/mobile-remote-hello
 *
 * Mobile remote component exposed via Module Federation v2.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered natively in React Native on mobile platforms.
 */

import React from 'react';
import { HelloUniversal } from '@universal/shared-hello-ui';
import { ThemeProvider } from '@universal/shared-theme-context';
import { I18nProvider, locales, type LocaleCode } from '@universal/shared-i18n';

export interface HelloRemoteProps {
  name?: string;
  onPress?: () => void;
  /** Locale passed from host for i18n synchronization */
  locale?: LocaleCode;
}

/**
 * HelloRemote - Mobile remote component exposed via MFv2
 *
 * Wraps HelloUniversal with ThemeProvider and I18nProvider since remote modules
 * load as separate bundles and don't inherit context from the host.
 *
 * The locale prop allows the host to pass its current locale so the remote
 * can display translations in the same language as the host.
 */
export default function HelloRemote({ name, onPress, locale = 'en' }: HelloRemoteProps) {
  // Use key to force I18nProvider re-mount when locale changes from host
  return (
    <I18nProvider key={locale} translations={locales} initialLocale={locale}>
      <ThemeProvider>
        <HelloUniversal name={name} onPress={onPress} />
      </ThemeProvider>
    </I18nProvider>
  );
}
