import type { LocaleCode } from '../types';
import { DEFAULT_LOCALE } from '../types';
import { availableLocales, isLocaleSupported } from '../locales';

/**
 * Platform-aware locale detection utilities.
 *
 * Detects the user's preferred locale from various sources:
 * - React Native: Device settings via NativeModules
 * - Web: navigator.language/languages
 * - Fallback: DEFAULT_LOCALE ('en')
 *
 * Note: This module uses environment detection to work on both
 * web and mobile without static imports from react-native.
 * Mobile locale detection requires the host app to configure
 * NativeModules access separately.
 */

// Environment detection helpers
// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Cache for mobile platform detection result
let _mobileNativeModules: Record<string, unknown> | null | undefined = undefined;

/**
 * Get NativeModules if running in React Native.
 * Returns null if not available (web environment).
 */
function getMobileNativeModules(): Record<string, unknown> | null {
  if (_mobileNativeModules !== undefined) {
    return _mobileNativeModules;
  }

  // In browser, no NativeModules
  if (isBrowser) {
    _mobileNativeModules = null;
    return null;
  }

  // Try to access NativeModules via global (set by host app)
  // This avoids static require('react-native') which breaks web builds
  if (typeof global !== 'undefined') {
    const g = global as Record<string, unknown>;
    // Host app should expose NativeModules on global for i18n
    if (g.__i18n_NativeModules) {
      _mobileNativeModules = g.__i18n_NativeModules as Record<string, unknown>;
      return _mobileNativeModules;
    }
  }

  _mobileNativeModules = null;
  return null;
}

/**
 * Detect platform based on environment.
 */
function getPlatformOS(): 'web' | 'ios' | 'android' {
  // Browser check first
  if (isBrowser) {
    return 'web';
  }

  // Check for mobile via NativeModules availability
  const nativeModules = getMobileNativeModules();
  if (nativeModules) {
    // iOS has SettingsManager
    if (nativeModules.SettingsManager) {
      return 'ios';
    }
    // Android has I18nManager with localeIdentifier
    if ((nativeModules.I18nManager as Record<string, unknown>)?.localeIdentifier) {
      return 'android';
    }
  }

  // Fallback - assume web-like environment
  return 'web';
}

/**
 * Get the device's preferred locale on iOS.
 *
 * @returns The device locale string or undefined
 */
function getIOSLocale(): string | undefined {
  try {
    const nativeModules = getMobileNativeModules();
    if (!nativeModules) return undefined;

    const settings = (nativeModules.SettingsManager as { settings?: Record<string, unknown> })?.settings;
    // iOS returns locale as 'en_US', we want 'en-US'
    const locale =
      (settings?.AppleLocale as string | undefined) || // iOS 12 and earlier
      (settings?.AppleLanguages as string[] | undefined)?.[0]; // iOS 13+

    return locale?.replace('_', '-');
  } catch {
    return undefined;
  }
}

/**
 * Get the device's preferred locale on Android.
 *
 * @returns The device locale string or undefined
 */
function getAndroidLocale(): string | undefined {
  try {
    const nativeModules = getMobileNativeModules();
    if (!nativeModules) return undefined;

    const locale = (nativeModules.I18nManager as { localeIdentifier?: string })?.localeIdentifier;
    // Android returns locale as 'en_US', we want 'en-US'
    return locale?.replace('_', '-');
  } catch {
    return undefined;
  }
}

/**
 * Get the browser's preferred locale on web.
 *
 * @returns The browser locale string or undefined
 */
function getWebLocale(): string | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  // navigator.language is the preferred language
  // navigator.languages is an array of preferred languages
  return navigator.language || navigator.languages?.[0];
}

/**
 * Get the device's preferred locale based on platform.
 *
 * @returns The device locale string (e.g., 'en-US', 'es-ES')
 */
export function getDeviceLocale(): string {
  let locale: string | undefined;
  const platformOS = getPlatformOS();

  if (platformOS === 'ios') {
    locale = getIOSLocale();
  } else if (platformOS === 'android') {
    locale = getAndroidLocale();
  } else {
    locale = getWebLocale();
  }

  return locale || DEFAULT_LOCALE;
}

/**
 * Get all preferred locales from the device/browser.
 *
 * Returns an array of locales in order of preference.
 * Useful for finding the best match from available translations.
 *
 * @returns Array of locale strings in order of preference
 */
export function getPreferredLocales(): string[] {
  const locales: string[] = [];
  const platformOS = getPlatformOS();

  if (platformOS === 'web' && typeof navigator !== 'undefined') {
    // Web: Use navigator.languages for full preference list
    if (navigator.languages && navigator.languages.length > 0) {
      locales.push(...navigator.languages);
    } else if (navigator.language) {
      locales.push(navigator.language);
    }
  } else {
    // Mobile: Get primary locale
    const deviceLocale = getDeviceLocale();
    if (deviceLocale) {
      locales.push(deviceLocale);
    }
  }

  // Always include default as fallback
  if (!locales.includes(DEFAULT_LOCALE)) {
    locales.push(DEFAULT_LOCALE);
  }

  return locales;
}

/**
 * Find the best matching supported locale from a list of preferred locales.
 *
 * Matching strategy:
 * 1. Exact match (e.g., 'en-US' matches 'en-US')
 * 2. Language match (e.g., 'en-US' matches 'en')
 * 3. Fallback to default locale
 *
 * @param preferredLocales - Array of preferred locales in order of preference
 * @returns The best matching supported locale code
 *
 * @example
 * ```ts
 * // Available: ['en', 'es', 'fr']
 *
 * findBestLocale(['en-US', 'en'])
 * // 'en' (exact match for 'en')
 *
 * findBestLocale(['pt-BR', 'en'])
 * // 'en' (no Portuguese, falls back to 'en')
 *
 * findBestLocale(['zh-TW', 'zh-CN', 'en'])
 * // 'zh' (language match for Chinese)
 * ```
 */
export function findBestLocale(preferredLocales: string[]): LocaleCode {
  for (const locale of preferredLocales) {
    // Try exact match
    if (isLocaleSupported(locale)) {
      return locale;
    }

    // Try language code only (e.g., 'en-US' -> 'en')
    const languageCode = locale.split('-')[0];
    if (isLocaleSupported(languageCode)) {
      return languageCode;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Detect and return the best locale for the current device/browser.
 *
 * This is the main entry point for locale detection. It combines
 * device locale detection with locale matching against available
 * translations.
 *
 * @returns The best matching supported locale code
 *
 * @example
 * ```ts
 * // On a device with locale set to 'es-MX'
 * // Available: ['en', 'es', 'fr']
 *
 * detectLocale()
 * // 'es' (Spanish is available, matches es-MX)
 *
 * // On a device with locale set to 'ja-JP'
 * // Available: ['en', 'es', 'fr']
 *
 * detectLocale()
 * // 'en' (Japanese not available, falls back to English)
 * ```
 */
export function detectLocale(): LocaleCode {
  const preferredLocales = getPreferredLocales();
  return findBestLocale(preferredLocales);
}

/**
 * Check if the detected locale is RTL (right-to-left).
 *
 * @returns True if the device locale is RTL
 */
export function isDeviceRTL(): boolean {
  const locale = detectLocale();
  // RTL languages: Arabic, Hebrew, Persian, Urdu
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  const languageCode = locale.split('-')[0];
  return rtlLanguages.includes(languageCode);
}

/**
 * Get the text direction for the current locale.
 *
 * @returns 'rtl' for RTL locales, 'ltr' otherwise
 */
export function getTextDirection(): 'ltr' | 'rtl' {
  return isDeviceRTL() ? 'rtl' : 'ltr';
}

/**
 * Get available locales that the user might prefer.
 *
 * Returns the intersection of device preferred locales and available
 * translations, useful for displaying a language selector.
 *
 * @returns Array of available locale codes that match user preferences
 */
export function getAvailablePreferredLocales(): LocaleCode[] {
  const preferred = getPreferredLocales();
  const available: LocaleCode[] = [];

  for (const locale of preferred) {
    if (isLocaleSupported(locale) && !available.includes(locale)) {
      available.push(locale);
    }

    const languageCode = locale.split('-')[0];
    if (isLocaleSupported(languageCode) && !available.includes(languageCode)) {
      available.push(languageCode);
    }
  }

  // Always include all available locales for the selector
  for (const locale of availableLocales) {
    if (!available.includes(locale)) {
      available.push(locale);
    }
  }

  return available;
}
