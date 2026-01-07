/**
 * Translation utilities for the i18n package.
 */

// Variable interpolation
export {
  interpolate,
  extractVariables,
  hasInterpolation,
  validateInterpolation,
  createInterpolator,
} from './interpolate';

// Platform-aware locale detection
export {
  getDeviceLocale,
  getPreferredLocales,
  findBestLocale,
  detectLocale,
  isDeviceRTL,
  getTextDirection,
  getAvailablePreferredLocales,
} from './detectLocale';

// Locale persistence
export {
  configureLocaleStorage,
  saveLocale,
  loadLocale,
  clearLocale,
  loadOrDetectLocale,
  hasPersistedLocale,
  getCachedLocale,
} from './persistLocale';
