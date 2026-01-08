/**
 * Jest configuration for web-shell integration tests
 *
 * Integration tests verify cross-package interactions, provider composition,
 * routing behavior, and API interactions without full browser automation.
 */

module.exports = {
  displayName: 'web-shell-integration',
  rootDir: '.',
  testMatch: ['<rootDir>/src/__integration__/**/*.test.{ts,tsx}'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/__integration__/setup.ts'],
  moduleNameMapper: {
    // Force React to use web-shell's version (19.2.0) to avoid conflicts
    // with root node_modules (19.1.0 for mobile)
    '^react$': '<rootDir>/node_modules/react',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
    '^react/jsx-dev-runtime$': '<rootDir>/node_modules/react/jsx-dev-runtime',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/client$': '<rootDir>/node_modules/react-dom/client',
    // Map react-native to react-native-web (same as production)
    '^react-native$': '<rootDir>/node_modules/react-native-web',
    // Map workspace dependencies to source for better debugging
    '^@universal/shared-utils$': '<rootDir>/../shared-utils/src/index.ts',
    '^@universal/shared-design-tokens$': '<rootDir>/../shared-design-tokens/src/index.ts',
    '^@universal/shared-theme-context$': '<rootDir>/../shared-theme-context/src/index.ts',
    '^@universal/shared-a11y$': '<rootDir>/../shared-a11y/src/index.ts',
    '^@universal/shared-i18n$': '<rootDir>/../shared-i18n/src/index.ts',
    '^@universal/shared-event-bus$': '<rootDir>/../shared-event-bus/src/index.ts',
    '^@universal/shared-data-layer$': '<rootDir>/../shared-data-layer/src/index.ts',
    '^@universal/shared-router$': '<rootDir>/../shared-router/src/index.ts',
  },
  // Longer timeout for integration tests
  testTimeout: 10000,
  // Collect coverage from integration test runs
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__integration__/**',
  ],
};
