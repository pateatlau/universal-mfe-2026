import { useCallback, useMemo } from 'react';
import { useI18nContext } from './I18nProvider';
import {
  TranslateOptions,
  TranslationValue,
  TranslationNamespace,
  PluralRules,
} from './types';
import { getPluralCategory } from './pluralize';

/**
 * Result of the useTranslation hook.
 */
export interface UseTranslationResult {
  /**
   * Translate a key to the current locale.
   *
   * @param key - The translation key (e.g., 'greeting', 'buttons.submit')
   * @param options - Translation options
   * @returns The translated string
   */
  t: (key: string, options?: TranslateOptions) => string;

  /**
   * Check if a translation key exists.
   *
   * @param key - The translation key to check
   * @returns True if the translation exists
   */
  exists: (key: string) => boolean;

  /**
   * Current locale code.
   */
  locale: string;

  /**
   * Whether translations are loading.
   */
  isLoading: boolean;
}

/**
 * Interpolate variables into a translation string.
 *
 * @param text - The translation string with placeholders
 * @param params - The parameters to interpolate
 * @returns The interpolated string
 *
 * @example
 * interpolate('Hello, {{name}}!', { name: 'World' }) // 'Hello, World!'
 */
function interpolate(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

/**
 * Get a nested value from an object using a dot-separated path.
 */
function getNestedValue(
  obj: TranslationNamespace,
  path: string
): TranslationValue | TranslationNamespace | undefined {
  const keys = path.split('.');
  let current: TranslationValue | TranslationNamespace | undefined = obj;

  for (const key of keys) {
    if (current === undefined || typeof current === 'string' || typeof current === 'function') {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Hook for accessing translations in a component.
 *
 * @param namespace - The namespace to use for translations (e.g., 'common', 'hello')
 * @returns Translation utilities
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale } = useTranslation('common');
 *
 *   return (
 *     <View>
 *       <Text>{t('greeting', { params: { name: 'World' } })}</Text>
 *       <Text>{t('items', { count: 5 })}</Text>
 *       <Text>Current locale: {locale}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTranslation(namespace: string = 'common'): UseTranslationResult {
  const { locale, translations, isLoading } = useI18nContext();

  const t = useCallback(
    (key: string, options: TranslateOptions = {}): string => {
      const {
        params = {},
        count,
        defaultValue,
        namespace: overrideNamespace,
      } = options;

      const ns = overrideNamespace ?? namespace;
      const localeTranslations = translations[locale];

      if (!localeTranslations) {
        return defaultValue ?? key;
      }

      const namespaceTranslations = localeTranslations[ns];
      if (!namespaceTranslations) {
        return defaultValue ?? key;
      }

      let value = getNestedValue(namespaceTranslations, key);

      // Handle pluralization
      if (count !== undefined && value && typeof value === 'object') {
        const pluralRules = value as unknown as PluralRules;
        const category = getPluralCategory(locale, count);

        // Try to get the specific plural form, fall back to 'other'
        const pluralValue =
          pluralRules[category] ?? pluralRules.other ?? pluralRules.one;

        if (pluralValue) {
          value = pluralValue;
        }
      }

      // Handle translation value
      if (typeof value === 'function') {
        return value({ ...params, count });
      }

      if (typeof value === 'string') {
        // Add count to params for interpolation
        const allParams = count !== undefined ? { ...params, count } : params;
        return interpolate(value, allParams);
      }

      return defaultValue ?? key;
    },
    [locale, translations, namespace]
  );

  const exists = useCallback(
    (key: string): boolean => {
      const localeTranslations = translations[locale];
      if (!localeTranslations) return false;

      const namespaceTranslations = localeTranslations[namespace];
      if (!namespaceTranslations) return false;

      return getNestedValue(namespaceTranslations, key) !== undefined;
    },
    [locale, translations, namespace]
  );

  return useMemo(
    () => ({
      t,
      exists,
      locale,
      isLoading,
    }),
    [t, exists, locale, isLoading]
  );
}

/**
 * Create a typed translation function for a specific namespace.
 * Provides better autocomplete when used with a typed translations object.
 *
 * @example
 * ```tsx
 * // Define your translation keys
 * type CommonKeys = 'greeting' | 'farewell' | 'buttons.submit';
 *
 * function MyComponent() {
 *   const { t } = useTranslation('common');
 *   const typedT = createTypedT<CommonKeys>(t);
 *
 *   return <Text>{typedT('greeting')}</Text>;
 * }
 * ```
 */
export function createTypedT<K extends string>(
  t: (key: string, options?: TranslateOptions) => string
): (key: K, options?: TranslateOptions) => string {
  return t as (key: K, options?: TranslateOptions) => string;
}

export default useTranslation;
