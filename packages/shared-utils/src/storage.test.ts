/**
 * @universal/shared-utils
 * 
 * Tests for cross-platform storage utilities
 */

// Mock localStorage for web tests BEFORE importing storage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  const storage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };

  return storage;
})();

// Mock window.localStorage for Node.js test environment BEFORE importing storage
// Use type assertion to avoid conflicts with DOM types
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    localStorage: mockLocalStorage,
  };
} else {
  Object.defineProperty((globalThis as any).window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });
}

// Import storage AFTER setting up mocks
import { storage, setJSON, getJSON, setString, getString } from './storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear storage before each test
    mockLocalStorage.clear();
  });

  describe('setString and getString', () => {
    it('should store and retrieve a string value', async () => {
      await setString('test-key', 'test-value');
      const value = await getString('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const value = await getString('non-existent-key');
      expect(value).toBeNull();
    });

    it('should overwrite existing value', async () => {
      await setString('test-key', 'value1');
      await setString('test-key', 'value2');
      const value = await getString('test-key');
      expect(value).toBe('value2');
    });
  });

  describe('setJSON and getJSON', () => {
    it('should store and retrieve a JSON object', async () => {
      const testObject = { name: 'John', age: 30 };
      await setJSON('test-key', testObject);
      const value = await getJSON('test-key');
      expect(value).toEqual(testObject);
    });

    it('should store and retrieve a JSON array', async () => {
      const testArray = [1, 2, 3, 'test'];
      await setJSON('test-key', testArray);
      const value = await getJSON('test-key');
      expect(value).toEqual(testArray);
    });

    it('should return null for non-existent key', async () => {
      const value = await getJSON('non-existent-key');
      expect(value).toBeNull();
    });

    it('should handle invalid JSON gracefully', async () => {
      // Manually set invalid JSON
      mockLocalStorage.setItem('invalid-json', '{ invalid json }');
      const value = await getJSON('invalid-json');
      expect(value).toBeNull();
    });
  });

  describe('storage interface', () => {
    it('should support getAllKeys', async () => {
      await setString('key1', 'value1');
      await setString('key2', 'value2');
      const keys = await storage.getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should support removeItem', async () => {
      await setString('test-key', 'test-value');
      await storage.removeItem('test-key');
      const value = await getString('test-key');
      expect(value).toBeNull();
    });

    it('should support clear', async () => {
      await setString('key1', 'value1');
      await setString('key2', 'value2');
      await storage.clear();
      const keys = await storage.getAllKeys();
      expect(keys).toHaveLength(0);
    });
  });
});

