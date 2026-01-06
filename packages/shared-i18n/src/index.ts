/**
 * @universal/shared-i18n
 *
 * Internationalization (i18n) package for the Universal Microfrontend Platform.
 *
 * Features:
 * - React context-based translation management
 * - Namespace isolation for MFE translations
 * - Pluralization support via Intl.PluralRules
 * - Date, number, currency, and relative time formatting
 * - RTL language detection
 * - Type-safe translation functions
 *
 * @example
 * ```tsx
 * import {
 *   I18nProvider,
 *   useTranslation,
 *   useLocale,
 *   formatDate,
 *   formatCurrency,
 * } from '@universal/shared-i18n';
 *
 * // Define translations
 * const translations = {
 *   en: {
 *     common: {
 *       greeting: 'Hello, {{name}}!',
 *       items: {
 *         one: '{{count}} item',
 *         other: '{{count}} items',
 *       },
 *     },
 *   },
 *   es: {
 *     common: {
 *       greeting: '¡Hola, {{name}}!',
 *       items: {
 *         one: '{{count}} artículo',
 *         other: '{{count}} artículos',
 *       },
 *     },
 *   },
 * };
 *
 * // Wrap app with provider
 * function App() {
 *   return (
 *     <I18nProvider translations={translations} initialLocale="en">
 *       <MyComponent />
 *     </I18nProvider>
 *   );
 * }
 *
 * // Use translations in components
 * function MyComponent() {
 *   const { t } = useTranslation('common');
 *   const { locale, setLocale, isRTL } = useLocale();
 *
 *   return (
 *     <View style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
 *       <Text>{t('greeting', { params: { name: 'World' } })}</Text>
 *       <Text>{t('items', { count: 5 })}</Text>
 *       <Text>{formatDate(new Date(), locale)}</Text>
 *       <Text>{formatCurrency(99.99, 'USD', locale)}</Text>
 *     </View>
 *   );
 * }
 * ```
 */

// Types
export type {
  LocaleCode,
  TranslationValue,
  TranslationNamespace,
  Translations,
  TranslationResources,
  TranslateOptions,
  PluralRules,
  PluralCategory,
  DateFormatOptions,
  NumberFormatOptions,
  I18nContextValue,
  I18nProviderProps,
} from './types';

export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './types';

// Provider and context
export {
  I18nProvider,
  useI18nContext,
  withI18n,
  mergeTranslations,
} from './I18nProvider';

// Hooks
export { useTranslation, createTypedT } from './useTranslation';
export type { UseTranslationResult } from './useTranslation';

export { useLocale, getBestMatchingLocale } from './useLocale';
export type { UseLocaleResult } from './useLocale';

// Pluralization
export {
  getPluralCategory,
  pluralize,
  formatCount,
  getOrdinalSuffix,
  formatOrdinal,
} from './pluralize';

// Formatters
export {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  formatRelativeTimeAuto,
  formatList,
  formatBytes,
} from './formatters';
