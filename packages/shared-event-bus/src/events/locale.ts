/**
 * Locale Events
 *
 * Events for internationalization and locale changes.
 *
 * @version 1 - Initial release
 */

import type { EventDefinition } from '../types';

/**
 * Locale has changed.
 *
 * Emitted by host when locale changes.
 * MFEs can listen to sync their locale state.
 *
 * @example
 * ```ts
 * useEventListener('LOCALE_CHANGED', (event) => {
 *   setLocalLocale(event.payload.locale);
 * });
 * ```
 */
export type LocaleChangedEvent = EventDefinition<
  'LOCALE_CHANGED',
  {
    /** New locale code (e.g., 'en', 'es', 'fr') */
    locale: string;
    /** Previous locale code */
    previousLocale?: string;
    /** Text direction for the locale */
    direction?: 'ltr' | 'rtl';
  },
  1
>;

/**
 * Request to change locale.
 *
 * MFEs emit this to request locale change.
 * Host handles the actual locale switch.
 *
 * @example
 * ```ts
 * emit('LOCALE_CHANGE_REQUEST', { locale: 'es' });
 * ```
 */
export type LocaleChangeRequestEvent = EventDefinition<
  'LOCALE_CHANGE_REQUEST',
  {
    /** Requested locale code */
    locale: string;
  },
  1
>;

/**
 * Union of all locale events.
 */
export type LocaleEvents = LocaleChangedEvent | LocaleChangeRequestEvent;

/**
 * Locale event type constants.
 */
export const LocaleEventTypes = {
  LOCALE_CHANGED: 'LOCALE_CHANGED',
  LOCALE_CHANGE_REQUEST: 'LOCALE_CHANGE_REQUEST',
} as const;
