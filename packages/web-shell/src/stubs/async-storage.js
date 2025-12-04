/**
 * Stub for @react-native-async-storage/async-storage
 * 
 * This is used in web builds to replace AsyncStorage with a no-op implementation.
 * AsyncStorage is React Native only and should not be bundled in web builds.
 */

export default {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
  clear: () => Promise.resolve(),
  getAllKeys: () => Promise.resolve([]),
};

