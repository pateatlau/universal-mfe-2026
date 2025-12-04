/**
 * @universal/shared-utils
 * 
 * Cross-platform storage abstraction.
 * 
 * Uses localStorage on web and AsyncStorage on mobile.
 * 
 * This is a platform-agnostic storage interface that works on both web and mobile.
 */

/**
 * Storage interface for cross-platform storage operations
 */
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Web storage implementation using localStorage
 */
class WebStorage implements Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('localStorage.getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('localStorage.setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('localStorage.removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (error) {
      console.error('localStorage.clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Object.keys on localStorage returns all keys including methods
        // We need to iterate using localStorage.length and key() method
        const keys: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            keys.push(key);
          }
        }
        return keys;
      }
      return [];
    } catch (error) {
      console.error('localStorage.getAllKeys error:', error);
      return [];
    }
  }
}

/**
 * Mobile storage implementation using AsyncStorage
 */
class MobileStorage implements Storage {
  private asyncStorage: any;

  constructor() {
    // Dynamic require to avoid bundling AsyncStorage in web builds
    // This will be resolved at runtime on mobile platforms only
    this.asyncStorage = null;
    try {
      // Only try to require AsyncStorage if we're definitely not in a web environment
      // Web builds use NormalModuleReplacementPlugin to replace AsyncStorage with a stub
      if (typeof require !== 'undefined' && typeof window === 'undefined') {
        // Use a function to make the require truly dynamic and prevent static analysis
        const getAsyncStorage = () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('@react-native-async-storage/async-storage');
          } catch {
            return null;
          }
        };
        const AsyncStorageModule = getAsyncStorage();
        if (AsyncStorageModule) {
          this.asyncStorage = AsyncStorageModule?.default || AsyncStorageModule;
        }
      }
    } catch (error) {
      // AsyncStorage not available (e.g., in web environment or not installed)
      this.asyncStorage = null;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.asyncStorage) {
      throw new Error('AsyncStorage is not available. This should only be used on mobile platforms.');
    }
    try {
      return await this.asyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage.getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.asyncStorage) {
      throw new Error('AsyncStorage is not available. This should only be used on mobile platforms.');
    }
    try {
      await this.asyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage.setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.asyncStorage) {
      throw new Error('AsyncStorage is not available. This should only be used on mobile platforms.');
    }
    try {
      await this.asyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage.removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    if (!this.asyncStorage) {
      throw new Error('AsyncStorage is not available. This should only be used on mobile platforms.');
    }
    try {
      await this.asyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage.clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    if (!this.asyncStorage) {
      throw new Error('AsyncStorage is not available. This should only be used on mobile platforms.');
    }
    try {
      return await this.asyncStorage.getAllKeys();
    } catch (error) {
      console.error('AsyncStorage.getAllKeys error:', error);
      return [];
    }
  }
}

/**
 * Detects the platform and returns the appropriate storage implementation
 */
function getStorage(): Storage {
  // Check if we're in a web environment (has window and localStorage)
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return new WebStorage();
  }

  // Check if we're in a React Native environment
  // React Native has a global object but no window.localStorage
  // Also check for Platform to be more certain
  if (
    typeof global !== 'undefined' &&
    (typeof global.window === 'undefined' || global.window === null)
  ) {
    // Try to detect React Native by checking for Platform or other RN globals
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RNPlatform = require('react-native')?.Platform;
      if (RNPlatform) {
        return new MobileStorage();
      }
    } catch {
      // react-native not available, might be web
    }
    
    // If we can't require react-native, fallback to web storage
    // This prevents trying to use AsyncStorage in web builds
    return new WebStorage();
  }

  // Fallback to web storage if we can't determine the platform
  return new WebStorage();
}

/**
 * Cross-platform storage instance
 * 
 * Automatically uses localStorage on web and AsyncStorage on mobile.
 */
export const storage: Storage = getStorage();

/**
 * Convenience functions for common storage operations
 */

/**
 * Stores a JSON-serializable value
 */
export async function setJSON<T>(key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}

/**
 * Retrieves and parses a JSON value
 */
export async function getJSON<T>(key: string): Promise<T | null> {
  const item = await storage.getItem(key);
  if (item === null) {
    return null;
  }
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to parse JSON for key "${key}":`, error);
    return null;
  }
}

/**
 * Stores a string value
 */
export async function setString(key: string, value: string): Promise<void> {
  await storage.setItem(key, value);
}

/**
 * Retrieves a string value
 */
export async function getString(key: string): Promise<string | null> {
  return await storage.getItem(key);
}

