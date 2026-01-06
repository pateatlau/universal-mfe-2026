import { useCallback } from 'react';
import { useI18nContext } from './I18nProvider';
import { LocaleCode, SUPPORTED_LOCALES } from './types';

/**
 * Result of the useLocale hook.
 */
export interface UseLocaleResult {
  /** Current locale code */
  locale: LocaleCode;

  /** Set the current locale */
  setLocale: (locale: LocaleCode) => void;

  /** Display name of the current locale */
  localeName: string;

  /** List of all supported locales with their display names */
  supportedLocales: Array<{ code: LocaleCode; name: string }>;

  /** Check if a locale is supported */
  isSupported: (locale: string) => locale is LocaleCode;

  /** Whether the current locale is RTL (right-to-left) */
  isRTL: boolean;

  /** Whether translations are loading */
  isLoading: boolean;
}

/**
 * RTL (right-to-left) locales.
 */
const RTL_LOCALES: Set<string> = new Set(['ar', 'he', 'fa', 'ur']);

/**
 * Hook for managing locale state.
 *
 * Provides utilities for getting/setting the current locale,
 * checking supported locales, and detecting RTL languages.
 *
 * @returns Locale management utilities
 *
 * @example
 * ```tsx
 * function LocaleSwitcher() {
 *   const { locale, setLocale, supportedLocales, localeName } = useLocale();
 *
 *   return (
 *     <View>
 *       <Text>Current: {localeName}</Text>
 *       {supportedLocales.map(({ code, name }) => (
 *         <Pressable
 *           key={code}
 *           onPress={() => setLocale(code)}
 *           accessibilityRole="button"
 *           accessibilityState={{ selected: code === locale }}
 *         >
 *           <Text>{name}</Text>
 *         </Pressable>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */
export function useLocale(): UseLocaleResult {
  const { locale, setLocale, isLoading } = useI18nContext();

  const localeName = SUPPORTED_LOCALES[locale] ?? locale;

  const supportedLocales = Object.entries(SUPPORTED_LOCALES).map(
    ([code, name]) => ({
      code: code as LocaleCode,
      name,
    })
  );

  const isSupported = useCallback(
    (testLocale: string): testLocale is LocaleCode => {
      return testLocale in SUPPORTED_LOCALES;
    },
    []
  );

  const isRTL = RTL_LOCALES.has(locale);

  return {
    locale,
    setLocale,
    localeName,
    supportedLocales,
    isSupported,
    isRTL,
    isLoading,
  };
}

/**
 * Get the best matching locale from a list of preferred locales.
 *
 * @param preferredLocales - List of preferred locale codes (e.g., from navigator.languages)
 * @param fallback - Fallback locale if no match is found
 * @returns The best matching supported locale
 *
 * @example
 * ```ts
 * // On web
 * const locale = getBestMatchingLocale(navigator.languages);
 *
 * // On native
 * import { getLocales } from 'react-native-localize';
 * const locale = getBestMatchingLocale(getLocales().map(l => l.languageTag));
 * ```
 */
export function getBestMatchingLocale(
  preferredLocales: readonly string[],
  fallback: LocaleCode = 'en'
): LocaleCode {
  for (const preferred of preferredLocales) {
    // Try exact match first (e.g., 'en-US' -> 'en-US')
    if (preferred in SUPPORTED_LOCALES) {
      return preferred as LocaleCode;
    }

    // Try language-only match (e.g., 'en-US' -> 'en')
    const languageOnly = preferred.split('-')[0];
    if (languageOnly && languageOnly in SUPPORTED_LOCALES) {
      return languageOnly as LocaleCode;
    }
  }

  return fallback;
}

export default useLocale;
