import { PluralCategory, LocaleCode } from './types';

/**
 * Get the plural category for a given count and locale.
 * Uses the Intl.PluralRules API when available, with fallback for basic cases.
 *
 * @param locale - The locale code
 * @param count - The count to get the plural form for
 * @returns The plural category
 *
 * @example
 * ```ts
 * getPluralCategory('en', 0) // 'other'
 * getPluralCategory('en', 1) // 'one'
 * getPluralCategory('en', 2) // 'other'
 * getPluralCategory('ru', 2) // 'few'
 * getPluralCategory('ru', 5) // 'many'
 * ```
 */
export function getPluralCategory(locale: LocaleCode | string, count: number): PluralCategory {
  // Use Intl.PluralRules if available (modern browsers and React Native)
  if (typeof Intl !== 'undefined' && Intl.PluralRules) {
    try {
      const rules = new Intl.PluralRules(locale);
      return rules.select(count) as PluralCategory;
    } catch {
      // Fall back to simple rules if locale is not supported
    }
  }

  // Fallback for environments without Intl.PluralRules
  return getSimplePluralCategory(count);
}

/**
 * Simple plural category fallback for English-like languages.
 * Used when Intl.PluralRules is not available.
 */
function getSimplePluralCategory(count: number): PluralCategory {
  const absCount = Math.abs(count);

  if (absCount === 0) {
    return 'other'; // English treats 0 as 'other' (0 items)
  }

  if (absCount === 1) {
    return 'one';
  }

  return 'other';
}

/**
 * Create a pluralized string from plural rules and a count.
 *
 * @param rules - Object with plural form strings
 * @param count - The count to pluralize for
 * @param locale - The locale code
 * @returns The appropriate plural form string
 *
 * @example
 * ```ts
 * const rules = {
 *   zero: 'No items',
 *   one: '{{count}} item',
 *   other: '{{count}} items',
 * };
 *
 * pluralize(rules, 0, 'en') // 'No items'
 * pluralize(rules, 1, 'en') // '{{count}} item'
 * pluralize(rules, 5, 'en') // '{{count}} items'
 * ```
 */
export function pluralize(
  rules: Partial<Record<PluralCategory, string>>,
  count: number,
  locale: LocaleCode | string = 'en'
): string {
  const category = getPluralCategory(locale, count);

  // Try exact match first
  if (rules[category]) {
    return rules[category];
  }

  // Special case: if count is 0 and there's a 'zero' rule, use it
  if (count === 0 && rules.zero) {
    return rules.zero;
  }

  // Fall back to 'other' or 'one'
  return rules.other ?? rules.one ?? '';
}

/**
 * Format a count with its plural form.
 * Convenience function that combines count and pluralization.
 *
 * @param count - The count
 * @param singular - Singular form (e.g., 'item')
 * @param plural - Plural form (e.g., 'items'), defaults to singular + 's'
 * @returns Formatted string (e.g., '5 items')
 *
 * @example
 * ```ts
 * formatCount(1, 'item') // '1 item'
 * formatCount(5, 'item') // '5 items'
 * formatCount(3, 'child', 'children') // '3 children'
 * formatCount(0, 'result') // '0 results'
 * ```
 */
export function formatCount(
  count: number,
  singular: string,
  plural?: string
): string {
  const form = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${form}`;
}

/**
 * Ordinal suffixes for English.
 */
const ENGLISH_ORDINAL_SUFFIXES: Record<string, string> = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
};

/**
 * Get the ordinal suffix for a number (e.g., 'st', 'nd', 'rd', 'th').
 * Currently supports English; other locales fall back to basic behavior.
 *
 * @param number - The number to get the ordinal for
 * @param locale - The locale code
 * @returns The ordinal suffix
 *
 * @example
 * ```ts
 * getOrdinalSuffix(1, 'en')  // 'st' (1st)
 * getOrdinalSuffix(2, 'en')  // 'nd' (2nd)
 * getOrdinalSuffix(3, 'en')  // 'rd' (3rd)
 * getOrdinalSuffix(4, 'en')  // 'th' (4th)
 * getOrdinalSuffix(11, 'en') // 'th' (11th)
 * getOrdinalSuffix(21, 'en') // 'st' (21st)
 * ```
 */
export function getOrdinalSuffix(number: number, locale: LocaleCode | string = 'en'): string {
  // Use Intl.PluralRules with ordinal type if available
  if (typeof Intl !== 'undefined' && Intl.PluralRules) {
    try {
      const rules = new Intl.PluralRules(locale, { type: 'ordinal' });
      const category = rules.select(number);

      // Return locale-specific suffix (currently only English implemented)
      if (locale.startsWith('en')) {
        return ENGLISH_ORDINAL_SUFFIXES[category] ?? 'th';
      }

      // For other locales, return empty string (ordinals vary greatly)
      return '';
    } catch {
      // Fall back to simple English ordinals
    }
  }

  // Simple English fallback
  return getSimpleEnglishOrdinal(number);
}

/**
 * Simple English ordinal suffix fallback.
 */
function getSimpleEnglishOrdinal(number: number): string {
  const absNum = Math.abs(number);
  const lastDigit = absNum % 10;
  const lastTwoDigits = absNum % 100;

  // Special case for 11, 12, 13
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Format a number as an ordinal (e.g., '1st', '2nd', '3rd').
 *
 * @param number - The number to format
 * @param locale - The locale code
 * @returns The ordinal string
 *
 * @example
 * ```ts
 * formatOrdinal(1, 'en')  // '1st'
 * formatOrdinal(22, 'en') // '22nd'
 * formatOrdinal(3, 'en')  // '3rd'
 * ```
 */
export function formatOrdinal(number: number, locale: LocaleCode | string = 'en'): string {
  return `${number}${getOrdinalSuffix(number, locale)}`;
}
