/**
 * Jest Configuration for @universal/mobile-host
 * 
 * React Native mobile package - simplified config to avoid react-native preset Flow issues
 */

const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  displayName: 'mobile-host',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Mock react-native to avoid ES module and Flow syntax issues
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^react-native$': '<rootDir>/src/__mocks__/react-native.tsx',
    '^@callstack/repack/client$': '<rootDir>/src/__mocks__/repack-client.ts',
  },
  // Transform dependencies
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|@universal)/)',
  ],
};

