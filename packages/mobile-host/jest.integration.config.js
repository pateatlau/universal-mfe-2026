/**
 * Jest configuration for mobile-host integration tests
 *
 * Integration tests verify cross-package interactions, provider composition,
 * and navigation behavior using React Native Testing Library.
 *
 * Note: Uses ts-jest instead of babel-jest to avoid @react-native/babel-preset
 * dependency issues in the monorepo.
 */

module.exports = {
  displayName: 'mobile-host-integration',
  rootDir: '.',
  testMatch: ['<rootDir>/src/__integration__/**/*.test.{ts,tsx}'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/android/', '/ios/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/__integration__/setup.ts'],
  moduleNameMapper: {
    // Map workspace dependencies to source for better debugging
    '^@universal/shared-utils$': '<rootDir>/../shared-utils/src/index.ts',
    '^@universal/shared-design-tokens$':
      '<rootDir>/../shared-design-tokens/src/index.ts',
    '^@universal/shared-theme-context$':
      '<rootDir>/../shared-theme-context/src/index.ts',
    '^@universal/shared-a11y$': '<rootDir>/../shared-a11y/src/index.ts',
    '^@universal/shared-i18n$': '<rootDir>/../shared-i18n/src/index.ts',
    '^@universal/shared-event-bus$':
      '<rootDir>/../shared-event-bus/src/index.ts',
    '^@universal/shared-data-layer$':
      '<rootDir>/../shared-data-layer/src/index.ts',
    '^@universal/shared-router$': '<rootDir>/../shared-router/src/index.ts',
  },
  // No transformIgnorePatterns needed - using react-router-dom which works with ts-jest
  // Longer timeout for integration tests
  testTimeout: 15000,
  // Collect coverage from integration test runs
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__integration__/**',
  ],
};
