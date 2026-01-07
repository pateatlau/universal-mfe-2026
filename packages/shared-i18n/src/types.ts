/**
 * Supported locale codes.
 * Add new locales here as they are implemented.
 */
export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

/**
 * Default locale for the application.
 */
export const DEFAULT_LOCALE: LocaleCode = 'en';

/**
 * Supported locales with their display names.
 */
export const SUPPORTED_LOCALES: Record<LocaleCode, string> = {
  en: 'English',
  es: 'Español',
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
 * Translation value that can be a simple string or a function for interpolation.
 */
export type TranslationValue = string | ((params: Record<string, unknown>) => string);

/**
 * Nested translation object structure.
 * Supports arbitrary nesting for namespaced translations.
 */
export interface TranslationNamespace {
  [key: string]: TranslationValue | TranslationNamespace;
}

/**
 * Complete translations for a locale.
 * Each key is a namespace (e.g., 'common', 'hello', 'auth').
 */
export interface Translations {
  [namespace: string]: TranslationNamespace;
}

/**
 * Translation resource containing all translations for all locales.
 */
export type TranslationResources = {
  [locale in LocaleCode]?: Translations;
};

/**
 * Options for the translation function.
 */
export interface TranslateOptions {
  /** Parameters to interpolate into the translation string */
  params?: Record<string, string | number>;
  /** Count for pluralization */
  count?: number;
  /** Default value if translation is not found */
  defaultValue?: string;
  /** Namespace to use (overrides the hook's namespace) */
  namespace?: string;
}

/**
 * Pluralization rules for a locale.
 */
export interface PluralRules {
  /** Zero items (e.g., "no items") */
  zero?: string;
  /** One item (e.g., "1 item") */
  one: string;
  /** Two items (for languages with dual form) */
  two?: string;
  /** Few items (for languages with "few" form, e.g., Slavic) */
  few?: string;
  /** Many items (for languages with "many" form) */
  many?: string;
  /** Other/default (e.g., "5 items") */
  other: string;
}

/**
 * Plural form categories as defined by CLDR.
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Date format options.
 */
export interface DateFormatOptions {
  /** Date style: 'full', 'long', 'medium', 'short' */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  /** Time style: 'full', 'long', 'medium', 'short' */
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  /** Custom format options (overrides dateStyle/timeStyle) */
  custom?: Intl.DateTimeFormatOptions;
}

/**
 * Number format options.
 */
export interface NumberFormatOptions {
  /** Number style */
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  /** Currency code (required when style is 'currency') */
  currency?: string;
  /** Currency display style */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  /** Unit identifier (required when style is 'unit') */
  unit?: string;
  /** Minimum fraction digits */
  minimumFractionDigits?: number;
  /** Maximum fraction digits */
  maximumFractionDigits?: number;
  /** Use grouping separators (e.g., 1,000 vs 1000) */
  useGrouping?: boolean;
  /** Notation style */
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  /** Compact display style */
  compactDisplay?: 'short' | 'long';
}

/**
 * I18n context value provided to consumers.
 */
export interface I18nContextValue {
  /** Current locale */
  locale: LocaleCode;
  /** Set the current locale */
  setLocale: (locale: LocaleCode) => void;
  /** All loaded translations */
  translations: TranslationResources;
  /** Whether translations are currently loading */
  isLoading: boolean;
}

/**
 * Props for the I18nProvider component.
 */
export interface I18nProviderProps {
  /** Initial locale (defaults to DEFAULT_LOCALE) */
  initialLocale?: LocaleCode;
  /** Translation resources to load */
  translations: TranslationResources;
  /** Callback when locale changes */
  onLocaleChange?: (locale: LocaleCode) => void;
  /** Children to render */
  children: React.ReactNode;
}
