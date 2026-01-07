import type { LocaleCode } from '../types';
import { DEFAULT_LOCALE } from '../types';
import { isLocaleSupported } from '../locales';

/**
 * Locale persistence utilities.
 *
 * Saves and retrieves the user's locale preference using the
 * platform-appropriate storage mechanism:
 * - Web: localStorage
 * - Mobile: AsyncStorage (via @universal/shared-utils storage abstraction)
 *
 * Note: This module provides a simple in-memory fallback when storage
 * is not available. For production use with React Native, integrate
 * with @universal/shared-utils storage abstraction.
 */

/**
 * Storage key for persisted locale preference.
 */
const LOCALE_STORAGE_KEY = '@universal/i18n/locale';

/**
 * In-memory fallback storage for environments without persistent storage.
 */
let inMemoryLocale: LocaleCode | null = null;

/**
 * Storage interface for locale persistence.
 * Compatible with both localStorage (web) and AsyncStorage (mobile).
 */
interface LocaleStorage {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

/**
 * Storage implementation configured via configureLocaleStorage().
 * Must be set by the host application before using persistence functions.
 */
let storage: LocaleStorage | null = null;

/**
 * Get the configured storage implementation.
 *
 * Returns null if no storage has been configured via configureLocaleStorage().
 * This keeps the shared package platform-agnostic - host applications must
 * provide their own storage implementation (localStorage for web, AsyncStorage
 * for React Native, etc.).
 */
function getStorage(): LocaleStorage | null {
  return storage;
}

/**
 * Configure custom storage for locale persistence.
 *
 * Use this to integrate with AsyncStorage or other storage solutions
 * on React Native.
 *
 * @param customStorage - Storage implementation with get/set/remove methods
 *
 * @example
 * ```ts
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 *
 * // Configure AsyncStorage for React Native
 * configureLocaleStorage({
 *   getItem: AsyncStorage.getItem,
 *   setItem: AsyncStorage.setItem,
 *   removeItem: AsyncStorage.removeItem,
 * });
 * ```
 *
 * @example
 * ```ts
 * import { storage } from '@universal/shared-utils';
 *
 * // Use shared-utils storage abstraction
 * configureLocaleStorage({
 *   getItem: (key) => storage.getString(key),
 *   setItem: (key, value) => storage.set(key, value),
 *   removeItem: (key) => storage.delete(key),
 * });
 * ```
 */
export function configureLocaleStorage(customStorage: LocaleStorage): void {
  storage = customStorage;
}

/**
 * Save the user's locale preference to storage.
 *
 * @param locale - The locale code to persist
 * @returns Promise that resolves when the locale is saved
 *
 * @example
 * ```ts
 * await saveLocale('es');
 * // Locale 'es' is now persisted
 * ```
 */
export async function saveLocale(locale: LocaleCode): Promise<void> {
  // Always update in-memory cache
  inMemoryLocale = locale;

  const store = getStorage();
  if (store) {
    try {
      await store.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (error) {
      // Storage error - locale is still in memory
      if (__DEV__) {
        console.warn('[i18n] Failed to persist locale:', error);
      }
    }
  }
}

/**
 * Load the user's persisted locale preference.
 *
 * @returns Promise that resolves to the persisted locale, or null if none
 *
 * @example
 * ```ts
 * const locale = await loadLocale();
 * if (locale) {
 *   setLocale(locale);
 * }
 * ```
 */
export async function loadLocale(): Promise<LocaleCode | null> {
  // Check in-memory cache first
  if (inMemoryLocale) {
    return inMemoryLocale;
  }

  const store = getStorage();
  if (!store) {
    return null;
  }

  try {
    const stored = await store.getItem(LOCALE_STORAGE_KEY);

    if (stored && isLocaleSupported(stored)) {
      inMemoryLocale = stored;
      return stored;
    }

    return null;
  } catch (error) {
    if (__DEV__) {
      console.warn('[i18n] Failed to load persisted locale:', error);
    }
    return null;
  }
}

/**
 * Clear the persisted locale preference.
 *
 * The app will revert to auto-detection on next load.
 *
 * @returns Promise that resolves when the locale is cleared
 *
 * @example
 * ```ts
 * await clearLocale();
 * // Next app load will use auto-detected locale
 * ```
 */
export async function clearLocale(): Promise<void> {
  inMemoryLocale = null;

  const store = getStorage();
  if (store) {
    try {
      await store.removeItem(LOCALE_STORAGE_KEY);
    } catch (error) {
      if (__DEV__) {
        console.warn('[i18n] Failed to clear persisted locale:', error);
      }
    }
  }
}

/**
 * Load the persisted locale or detect from device.
 *
 * This is the recommended way to initialize the locale on app start.
 * It checks for a persisted preference first, then falls back to
 * device locale detection.
 *
 * @param detectFn - Optional custom detection function
 * @returns Promise that resolves to the initial locale
 *
 * @example
 * ```ts
 * import { detectLocale } from './detectLocale';
 *
 * // In app initialization
 * const initialLocale = await loadOrDetectLocale(detectLocale);
 * ```
 */
export async function loadOrDetectLocale(
  detectFn?: () => LocaleCode
): Promise<LocaleCode> {
  // Try to load persisted preference
  const persisted = await loadLocale();
  if (persisted) {
    return persisted;
  }

  // Use detection function if provided
  if (detectFn) {
    return detectFn();
  }

  // Fall back to default
  return DEFAULT_LOCALE;
}

/**
 * Check if a locale preference has been persisted.
 *
 * @returns Promise that resolves to true if a locale is persisted
 *
 * @example
 * ```ts
 * if (await hasPersistedLocale()) {
 *   // User has explicitly set a language preference
 * }
 * ```
 */
export async function hasPersistedLocale(): Promise<boolean> {
  const locale = await loadLocale();
  return locale !== null;
}

/**
 * Synchronously get the cached locale (in-memory only).
 *
 * This is useful for synchronous operations where you need the locale
 * but can't await. Returns null if no locale has been loaded yet.
 *
 * @returns The cached locale or null
 *
 * @example
 * ```ts
 * // After loadLocale() has been called
 * const locale = getCachedLocale() ?? DEFAULT_LOCALE;
 * ```
 */
export function getCachedLocale(): LocaleCode | null {
  return inMemoryLocale;
}

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean;
