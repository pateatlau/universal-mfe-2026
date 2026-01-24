/**
 * @universal/shared-i18n
 *
 * Internationalization (i18n) package for the Universal Microfrontend Platform.
 *
 * India-first localization with English (en) as default and Hindi (hi) as
 * the second supported language. Uses 'en-IN' formatting locale for Indian
 * number, date, and currency conventions (lakhs/crores, INR, etc.).
 *
 * Features:
 * - React context-based translation management
 * - Namespace isolation for MFE translations
 * - Pluralization support via Intl.PluralRules
 * - Date, number, currency, and relative time formatting
 * - Indian number formatting (lakhs/crores) via 'en-IN' locale
 * - INR (₹) as default currency
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
 *   hi: {
 *     common: {
 *       greeting: 'नमस्ते, {{name}}!',
 *       items: {
 *         one: '{{count}} आइटम',
 *         other: '{{count}} आइटम',
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
 *       <Text>{formatDate(new Date(), 'en-IN')}</Text>
 *       <Text>{formatCurrency(99999)}</Text>
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

export { DEFAULT_LOCALE, DEFAULT_FORMATTING_LOCALE, SUPPORTED_LOCALES } from './types';

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
  DEFAULT_CURRENCY,
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  formatRelativeTimeAuto,
  formatList,
  formatBytes,
} from './formatters';

// Locales
export {
  locales,
  availableLocales,
  defaultLocale,
  localeDisplayNames,
  rtlLocales,
  isRTLLocale,
  getLocaleDisplayName,
  isLocaleSupported,
  getTranslations,
  en,
  hi,
} from './locales';

// Utilities
export {
  // Interpolation
  interpolate,
  extractVariables,
  hasInterpolation,
  validateInterpolation,
  createInterpolator,
  // Locale detection
  getDeviceLocale,
  getPreferredLocales,
  findBestLocale,
  detectLocale,
  isDeviceRTL,
  getTextDirection,
  getAvailablePreferredLocales,
  // Locale persistence
  configureLocaleStorage,
  saveLocale,
  loadLocale,
  clearLocale,
  loadOrDetectLocale,
  hasPersistedLocale,
  getCachedLocale,
} from './utils';
