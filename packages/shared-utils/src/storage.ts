/**
 * Cross-Platform Storage Abstraction
 *
 * Provides a unified API for persistent storage across:
 * - Web: localStorage
 * - Mobile: AsyncStorage (via @react-native-async-storage/async-storage)
 *
 * IMPORTANT: This module must NOT import platform-specific code directly.
 * The actual storage implementation is injected at runtime by the host.
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

let storageAdapter: StorageAdapter | null = null;

/**
 * Configure the storage adapter.
 * Must be called once at app initialization by the host.
 *
 * @example
 * // Web host
 * import { configureStorage, createWebStorage } from '@universal/shared-utils';
 * configureStorage(createWebStorage());
 *
 * // Mobile host
 * import { configureStorage, createMobileStorage } from '@universal/shared-utils';
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * configureStorage(createMobileStorage(AsyncStorage));
 */
export function configureStorage(adapter: StorageAdapter): void {
  storageAdapter = adapter;
}

/**
 * Get the configured storage adapter.
 * Throws if storage hasn't been configured.
 */
export function getStorage(): StorageAdapter {
  if (!storageAdapter) {
    throw new Error(
      '[shared-utils] Storage not configured. ' +
        'Call configureStorage() with a platform-specific adapter at app initialization.'
    );
  }
  return storageAdapter;
}

/**
 * Check if storage has been configured.
 */
export function isStorageConfigured(): boolean {
  return storageAdapter !== null;
}

// =============================================================================
// JSON Helpers
// =============================================================================

/**
 * Get a JSON value from storage.
 */
export async function getJSON<T>(key: string): Promise<T | null> {
  const storage = getStorage();
  const value = await storage.getItem(key);
  if (value === null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn(`[shared-utils] Failed to parse JSON for key: ${key}`);
    return null;
  }
}

/**
 * Set a JSON value in storage.
 */
export async function setJSON<T>(key: string, value: T): Promise<void> {
  const storage = getStorage();
  await storage.setItem(key, JSON.stringify(value));
}

/**
 * Remove a value from storage.
 */
export async function removeItem(key: string): Promise<void> {
  const storage = getStorage();
  await storage.removeItem(key);
}

// =============================================================================
// Platform-Specific Adapter Factories
// =============================================================================

/**
 * Create a storage adapter for web (uses localStorage).
 */
export function createWebStorage(): StorageAdapter {
  return {
    async getItem(key: string): Promise<string | null> {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('[shared-utils] localStorage.setItem failed:', error);
      }
    },
    async removeItem(key: string): Promise<void> {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    },
    async clear(): Promise<void> {
      try {
        localStorage.clear();
      } catch {
        // Ignore
      }
    },
  };
}

/**
 * Create a storage adapter for mobile (uses AsyncStorage).
 *
 * @param asyncStorage - The AsyncStorage instance from @react-native-async-storage
 */
export function createMobileStorage(asyncStorage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}): StorageAdapter {
  return {
    getItem: (key) => asyncStorage.getItem(key),
    setItem: (key, value) => asyncStorage.setItem(key, value),
    removeItem: (key) => asyncStorage.removeItem(key),
    clear: () => asyncStorage.clear(),
  };
}

// =============================================================================
// Legacy Compatibility (for existing code that imports `storage`)
// =============================================================================

/**
 * Legacy storage object for backwards compatibility.
 * @deprecated Use getStorage() instead
 */
export const storage = {
  getItem: (key: string) => getStorage().getItem(key),
  setItem: (key: string, value: string) => getStorage().setItem(key, value),
  removeItem: (key: string) => getStorage().removeItem(key),
  clear: () => getStorage().clear(),
};
