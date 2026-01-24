import type { LocaleCode, TranslationResources, Translations } from '../types';
import { en } from './en';
import { hi } from './hi';

/**
 * Registry of all available translations.
 *
 * Each locale maps to a complete set of translations.
 * To add a new locale:
 * 1. Create a new file (e.g., `fr.ts`) following the structure in `en.ts`
 * 2. Import it here
 * 3. Add it to the `locales` object
 * 4. Add the locale code to `availableLocales`
 */
export const locales: TranslationResources = {
  en,
  hi,
};

/**
 * List of available locale codes.
 *
 * Used for locale detection and validation.
 */
export const availableLocales: LocaleCode[] = ['en', 'hi'];

/**
 * Default locale used when no locale is specified or detected.
 * Uses English with en-IN formatting for Indian locale conventions.
 */
export const defaultLocale: LocaleCode = 'en';

/**
 * Locale display names in their native language.
 *
 * Used for language selector UI.
 */
export const localeDisplayNames: Record<LocaleCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
};

/**
 * RTL (right-to-left) locales.
 *
 * These locales use right-to-left text direction.
 */
export const rtlLocales: LocaleCode[] = ['ar'];

/**
 * Check if a locale is RTL.
 *
 * @param locale - The locale code to check
 * @returns True if the locale uses RTL text direction
 */
export function isRTLLocale(locale: LocaleCode | string): boolean {
  return rtlLocales.includes(locale as LocaleCode);
}

/**
 * Get the display name for a locale.
 *
 * @param locale - The locale code
 * @returns The display name in the locale's native language, or the code if not found
 */
export function getLocaleDisplayName(locale: LocaleCode | string): string {
  return localeDisplayNames[locale as LocaleCode] ?? locale;
}

/**
 * Check if a locale is supported.
 *
 * @param locale - The locale code to check
 * @returns True if translations exist for the locale
 */
export function isLocaleSupported(locale: string): locale is LocaleCode {
  return availableLocales.includes(locale as LocaleCode);
}

/**
 * Get translations for a locale, falling back to default if not found.
 *
 * @param locale - The locale code
 * @returns The translations for the locale
 */
export function getTranslations(locale: LocaleCode | string): Translations {
  if (isLocaleSupported(locale) && locales[locale]) {
    return locales[locale];
  }

  // Try to match by language code (e.g., 'en-US' -> 'en')
  const languageCode = locale.split('-')[0];
  if (isLocaleSupported(languageCode) && locales[languageCode]) {
    return locales[languageCode];
  }

  // Return default locale translations, falling back to en if not defined
  return locales[defaultLocale] ?? en;
}

// Re-export individual locale files for direct imports
export { en } from './en';
export { hi } from './hi';
