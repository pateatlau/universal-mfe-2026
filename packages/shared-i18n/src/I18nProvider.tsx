import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  LocaleCode,
  DEFAULT_LOCALE,
  I18nContextValue,
  I18nProviderProps,
  TranslationResources,
} from './types';

/**
 * I18n context for providing translations throughout the app.
 */
const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Hook to access the I18n context.
 * Must be used within an I18nProvider.
 *
 * @throws Error if used outside of I18nProvider
 */
export function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
}

/**
 * Provider component for internationalization.
 *
 * Wrap your app or a subtree with this provider to enable translations.
 *
 * @example
 * ```tsx
 * import { I18nProvider } from '@universal/shared-i18n';
 * import { translations } from './locales';
 *
 * function App() {
 *   return (
 *     <I18nProvider
 *       translations={translations}
 *       initialLocale="en"
 *       onLocaleChange={(locale) => {
 *         // Persist locale preference
 *         saveLocale(locale);
 *       }}
 *     >
 *       <MyApp />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export function I18nProvider({
  initialLocale = DEFAULT_LOCALE,
  translations,
  onLocaleChange,
  children,
}: I18nProviderProps): React.ReactElement {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);
  const [isLoading, setIsLoading] = useState(false);

  const setLocale = useCallback(
    (newLocale: LocaleCode) => {
      if (newLocale === locale) return;

      setIsLoading(true);

      // Allow for async locale loading in the future
      setLocaleState(newLocale);
      onLocaleChange?.(newLocale);

      // Simulate brief loading state for UI feedback
      // In a real app, this would wait for translations to load
      setIsLoading(false);
    },
    [locale, onLocaleChange]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      translations,
      isLoading,
    }),
    [locale, setLocale, translations, isLoading]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * HOC to wrap a component with I18nProvider.
 * Useful for MFEs that need their own translation context.
 *
 * @example
 * ```tsx
 * const HelloRemoteWithI18n = withI18n(HelloRemote, {
 *   translations: helloTranslations,
 *   initialLocale: 'en',
 * });
 * ```
 */
export function withI18n<P extends object>(
  Component: React.ComponentType<P>,
  providerProps: Omit<I18nProviderProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <I18nProvider {...providerProps}>
      <Component {...props} />
    </I18nProvider>
  );

  WrappedComponent.displayName = `withI18n(${Component.displayName ?? Component.name ?? 'Component'})`;

  return WrappedComponent;
}

/**
 * Merge multiple translation resources together.
 * Useful for combining host and remote translations.
 *
 * @example
 * ```tsx
 * const allTranslations = mergeTranslations(
 *   hostTranslations,
 *   helloRemoteTranslations,
 *   authRemoteTranslations
 * );
 * ```
 */
export function mergeTranslations(
  ...resources: TranslationResources[]
): TranslationResources {
  const merged: TranslationResources = {};

  for (const resource of resources) {
    for (const [locale, translations] of Object.entries(resource)) {
      const localeKey = locale as LocaleCode;
      if (!merged[localeKey]) {
        merged[localeKey] = {};
      }

      // Deep merge translations
      for (const [namespace, values] of Object.entries(translations)) {
        merged[localeKey]![namespace] = {
          ...merged[localeKey]![namespace],
          ...values,
        };
      }
    }
  }

  return merged;
}

export default I18nProvider;
