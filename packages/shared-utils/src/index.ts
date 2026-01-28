/**
 * @universal/shared-utils
 *
 * Pure TypeScript utility library.
 *
 * Constraints:
 * - NO React Native imports
 * - NO React Native Web imports
 * - NO bundler-specific code
 * - NO host/remote imports
 * - Pure TypeScript only
 */

/**
 * Generates a greeting message
 */
export function getGreeting(name: string = 'World'): string {
  return `Hello, ${name}!`;
}

/**
 * Formats a message with optional prefix
 */
export function formatMessage(message: string, prefix?: string): string {
  return prefix ? `${prefix}: ${message}` : message;
}

// =============================================================================
// Storage Abstraction
// =============================================================================

export {
  type StorageAdapter,
  configureStorage,
  getStorage,
  isStorageConfigured,
  getJSON,
  setJSON,
  removeItem,
  createWebStorage,
  createMobileStorage,
  storage,
} from './storage';

