import { LocaleCode } from './types';
import type { DateFormatOptions, NumberFormatOptions } from './types';

/**
 * Format a date according to the specified locale and options.
 *
 * Uses Intl.DateTimeFormat for locale-aware formatting.
 *
 * @param date - The date to format
 * @param locale - The locale code
 * @param options - Formatting options
 * @returns The formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date(), 'en', { dateStyle: 'long' })
 * // 'January 7, 2026'
 *
 * formatDate(new Date(), 'de', { dateStyle: 'short' })
 * // '07.01.26'
 *
 * formatDate(new Date(), 'en', {
 *   custom: { weekday: 'long', month: 'short', day: 'numeric' }
 * })
 * // 'Tuesday, Jan 7'
 * ```
 */
export function formatDate(
  date: Date | number,
  locale: LocaleCode | string = 'en',
  options: DateFormatOptions = {}
): string {
  const { dateStyle, timeStyle, custom } = options;

  try {
    if (custom) {
      return new Intl.DateTimeFormat(locale, custom).format(date);
    }

    const formatOptions: Intl.DateTimeFormatOptions = {};

    if (dateStyle) {
      formatOptions.dateStyle = dateStyle;
    }

    if (timeStyle) {
      formatOptions.timeStyle = timeStyle;
    }

    // Default to medium date style if no options provided
    if (!dateStyle && !timeStyle) {
      formatOptions.dateStyle = 'medium';
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  } catch {
    // Fallback to ISO string if Intl fails
    return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
  }
}

/**
 * Format a number according to the specified locale and options.
 *
 * Uses Intl.NumberFormat for locale-aware formatting.
 *
 * @param value - The number to format
 * @param locale - The locale code
 * @param options - Formatting options
 * @returns The formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1234567.89, 'en')
 * // '1,234,567.89'
 *
 * formatNumber(1234567.89, 'de')
 * // '1.234.567,89'
 *
 * formatNumber(0.456, 'en', { style: 'percent' })
 * // '46%'
 *
 * formatNumber(1234, 'en', { notation: 'compact' })
 * // '1.2K'
 * ```
 */
export function formatNumber(
  value: number,
  locale: LocaleCode | string = 'en',
  options: NumberFormatOptions = {}
): string {
  try {
    const formatOptions: Intl.NumberFormatOptions = {
      style: options.style ?? 'decimal',
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
      useGrouping: options.useGrouping ?? true,
      notation: options.notation,
      compactDisplay: options.compactDisplay,
    };

    // Add unit if style is 'unit'
    if (options.style === 'unit' && options.unit) {
      formatOptions.unit = options.unit;
    }

    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch {
    // Fallback to basic number formatting
    return value.toString();
  }
}

/**
 * Format a value as currency according to the specified locale.
 *
 * Uses Intl.NumberFormat with currency style for locale-aware formatting.
 *
 * @param value - The monetary value to format
 * @param currency - The ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param locale - The locale code
 * @param options - Additional formatting options
 * @returns The formatted currency string
 *
 * @example
 * ```ts
 * formatCurrency(1234.56, 'USD', 'en')
 * // '$1,234.56'
 *
 * formatCurrency(1234.56, 'EUR', 'de')
 * // '1.234,56 €'
 *
 * formatCurrency(1234.56, 'JPY', 'ja')
 * // '￥1,235'
 *
 * formatCurrency(1234.56, 'USD', 'en', { currencyDisplay: 'name' })
 * // '1,234.56 US dollars'
 * ```
 */
export function formatCurrency(
  value: number,
  currency: string,
  locale: LocaleCode | string = 'en',
  options: Pick<NumberFormatOptions, 'currencyDisplay' | 'minimumFractionDigits' | 'maximumFractionDigits'> = {}
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: options.currencyDisplay ?? 'symbol',
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
    }).format(value);
  } catch {
    // Fallback to basic formatting
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours").
 *
 * Uses Intl.RelativeTimeFormat for locale-aware formatting.
 *
 * @param value - The numeric value (can be negative for past times)
 * @param unit - The time unit
 * @param locale - The locale code
 * @param style - The formatting style ('long', 'short', 'narrow')
 * @returns The formatted relative time string
 *
 * @example
 * ```ts
 * formatRelativeTime(-1, 'day', 'en')
 * // '1 day ago'
 *
 * formatRelativeTime(3, 'hour', 'en')
 * // 'in 3 hours'
 *
 * formatRelativeTime(-2, 'week', 'de')
 * // 'vor 2 Wochen'
 *
 * formatRelativeTime(1, 'month', 'en', 'short')
 * // 'in 1 mo.'
 * ```
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: LocaleCode | string = 'en',
  style: 'long' | 'short' | 'narrow' = 'long'
): string {
  try {
    return new Intl.RelativeTimeFormat(locale, {
      style,
      numeric: 'auto',
    }).format(value, unit);
  } catch {
    // Fallback to basic formatting
    const absValue = Math.abs(value);
    const unitStr = absValue === 1 ? unit : `${unit}s`;

    if (value < 0) {
      return `${absValue} ${unitStr} ago`;
    }
    return `in ${absValue} ${unitStr}`;
  }
}

/**
 * Get the auto-detected relative time from a date.
 *
 * Automatically selects the appropriate unit based on the time difference.
 *
 * @param date - The date to format relative to now
 * @param locale - The locale code
 * @param style - The formatting style
 * @returns The formatted relative time string
 *
 * @example
 * ```ts
 * // If now is Jan 7, 2026, 10:00 AM
 * formatRelativeTimeAuto(new Date('2026-01-07T08:00:00'), 'en')
 * // '2 hours ago'
 *
 * formatRelativeTimeAuto(new Date('2026-01-05'), 'en')
 * // '2 days ago'
 *
 * formatRelativeTimeAuto(new Date('2026-02-07'), 'en')
 * // 'in 1 month'
 * ```
 */
export function formatRelativeTimeAuto(
  date: Date | number,
  locale: LocaleCode | string = 'en',
  style: 'long' | 'short' | 'narrow' = 'long'
): string {
  const now = Date.now();
  const timestamp = date instanceof Date ? date.getTime() : date;
  const diffMs = timestamp - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  // Select appropriate unit based on magnitude
  if (Math.abs(diffSeconds) < 60) {
    return formatRelativeTime(diffSeconds, 'second', locale, style);
  }
  if (Math.abs(diffMinutes) < 60) {
    return formatRelativeTime(diffMinutes, 'minute', locale, style);
  }
  if (Math.abs(diffHours) < 24) {
    return formatRelativeTime(diffHours, 'hour', locale, style);
  }
  if (Math.abs(diffDays) < 7) {
    return formatRelativeTime(diffDays, 'day', locale, style);
  }
  if (Math.abs(diffWeeks) < 4) {
    return formatRelativeTime(diffWeeks, 'week', locale, style);
  }
  if (Math.abs(diffMonths) < 12) {
    return formatRelativeTime(diffMonths, 'month', locale, style);
  }
  return formatRelativeTime(diffYears, 'year', locale, style);
}

/**
 * Format a list of items according to the locale.
 *
 * Uses Intl.ListFormat for locale-aware list formatting.
 *
 * @param items - The list of items to format
 * @param locale - The locale code
 * @param type - The list type ('conjunction', 'disjunction', 'unit')
 * @param style - The formatting style
 * @returns The formatted list string
 *
 * @example
 * ```ts
 * formatList(['Apple', 'Banana', 'Orange'], 'en')
 * // 'Apple, Banana, and Orange'
 *
 * formatList(['Apple', 'Banana', 'Orange'], 'en', 'disjunction')
 * // 'Apple, Banana, or Orange'
 *
 * formatList(['Apple', 'Banana'], 'de')
 * // 'Apple und Banana'
 *
 * formatList(['3 hours', '5 minutes'], 'en', 'unit', 'short')
 * // '3 hours, 5 minutes'
 * ```
 */
export function formatList(
  items: string[],
  locale: LocaleCode | string = 'en',
  type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction',
  style: 'long' | 'short' | 'narrow' = 'long'
): string {
  if (items.length === 0) {
    return '';
  }

  if (items.length === 1) {
    return items[0];
  }

  try {
    return new Intl.ListFormat(locale, { type, style }).format(items);
  } catch {
    // Fallback to basic formatting
    if (items.length === 2) {
      const connector = type === 'disjunction' ? 'or' : 'and';
      return `${items[0]} ${connector} ${items[1]}`;
    }

    const allButLast = items.slice(0, -1);
    const last = items[items.length - 1];
    const connector = type === 'disjunction' ? 'or' : 'and';
    return `${allButLast.join(', ')}, ${connector} ${last}`;
  }
}

/**
 * Format bytes into human-readable size.
 *
 * @param bytes - The number of bytes
 * @param locale - The locale code
 * @param binary - Use binary (1024) vs decimal (1000) units
 * @returns The formatted size string
 *
 * @example
 * ```ts
 * formatBytes(1024, 'en')
 * // '1 KB'
 *
 * formatBytes(1048576, 'en', true)
 * // '1 MiB'
 *
 * formatBytes(1500000, 'de')
 * // '1,5 MB'
 * ```
 */
export function formatBytes(
  bytes: number,
  locale: LocaleCode | string = 'en',
  binary: boolean = false
): string {
  const units = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const divisor = binary ? 1024 : 1000;

  if (bytes === 0) {
    return `0 ${units[0]}`;
  }

  const absBytes = Math.abs(bytes);
  const unitIndex = Math.min(
    Math.floor(Math.log(absBytes) / Math.log(divisor)),
    units.length - 1
  );

  const value = bytes / Math.pow(divisor, unitIndex);

  try {
    const formatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: unitIndex === 0 ? 0 : 1,
    }).format(value);

    return `${formatted} ${units[unitIndex]}`;
  } catch {
    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }
}
