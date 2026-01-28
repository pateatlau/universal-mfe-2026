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
 * configureStorage(createWebStorage(window.localStorage));
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
 * @throws Error if value cannot be serialized to JSON
 */
export async function setJSON<T>(key: string, value: T): Promise<void> {
  const storage = getStorage();
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`[shared-utils] Failed to serialize value for key "${key}": ${message}`);
  }
  await storage.setItem(key, serialized);
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
 * Web Storage interface (matches browser's Storage interface).
 * Used for dependency injection in createWebStorage.
 */
export interface WebStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Check if a web storage instance is available and functional.
 * Tests actual read/write to detect quota/privacy issues.
 */
function isWebStorageAvailable(webStorage: WebStorage): boolean {
  try {
    const testKey = '__storage_test__';
    webStorage.setItem(testKey, testKey);
    webStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create an in-memory storage adapter (fallback when web storage unavailable).
 */
export function createInMemoryStorage(): StorageAdapter {
  const memoryStore = new Map<string, string>();
  return {
    async getItem(key: string): Promise<string | null> {
      return memoryStore.get(key) ?? null;
    },
    async setItem(key: string, value: string): Promise<void> {
      memoryStore.set(key, value);
    },
    async removeItem(key: string): Promise<void> {
      memoryStore.delete(key);
    },
    async clear(): Promise<void> {
      memoryStore.clear();
    },
  };
}

/**
 * Create a storage adapter for web from an injected Storage object.
 *
 * This function does NOT reference browser globals directly - the caller
 * must inject the storage object (e.g., window.localStorage).
 *
 * @param webStorage - The web Storage instance to use (e.g., window.localStorage)
 * @returns A StorageAdapter that wraps the provided storage, or an in-memory
 *          fallback if the storage is not functional
 *
 * @example
 * // In web host initialization:
 * import { configureStorage, createWebStorage } from '@universal/shared-utils';
 * configureStorage(createWebStorage(window.localStorage));
 */
export function createWebStorage(webStorage: WebStorage): StorageAdapter {
  if (!webStorage || !isWebStorageAvailable(webStorage)) {
    console.warn(
      '[shared-utils] Provided web storage is not available or not functional. ' +
        'Using in-memory fallback. Data will not persist across page reloads.'
    );
    return createInMemoryStorage();
  }

  return {
    async getItem(key: string): Promise<string | null> {
      try {
        return webStorage.getItem(key);
      } catch {
        return null;
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      try {
        webStorage.setItem(key, value);
      } catch (error) {
        console.warn('[shared-utils] webStorage.setItem failed:', error);
      }
    },
    async removeItem(key: string): Promise<void> {
      try {
        webStorage.removeItem(key);
      } catch {
        // Ignore
      }
    },
    async clear(): Promise<void> {
      try {
        webStorage.clear();
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
