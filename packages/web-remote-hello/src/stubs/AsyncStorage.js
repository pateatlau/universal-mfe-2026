/**
 * Web stub for @react-native-async-storage/async-storage
 * 
 * This is a no-op stub for web builds where AsyncStorage is not available.
 * For actual storage on web, use localStorage directly or create a proper abstraction.
 */

const AsyncStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
  getAllKeys: async () => [],
  multiGet: async () => [],
  multiSet: async () => {},
  multiRemove: async () => {},
};

export default AsyncStorage;

