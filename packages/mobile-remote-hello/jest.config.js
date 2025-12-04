/**
 * Jest Configuration for @universal/mobile-remote-hello
 * 
 * React Native mobile remote package - simplified config to avoid react-native preset Flow issues
 */

const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  displayName: 'mobile-remote-hello',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Mock react-native to avoid ES module and Flow syntax issues
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^react-native$': '<rootDir>/src/__mocks__/react-native.tsx',
  },
  // Transform dependencies
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|@universal)/)',
  ],
};

