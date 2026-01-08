/** @type {import('jest').Config} */
module.exports = {
  displayName: 'shared-hello-ui',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironment: 'jsdom',
  // Ignore dist folder to avoid duplicate mock warnings
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  // Use the root jest.setup.js
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  // Module name mapping for workspace dependencies and react-native mock
  moduleNameMapper: {
    // Mock react-native with our custom mock
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
    // Workspace dependencies
    '^@universal/shared-utils$': '<rootDir>/../shared-utils/src/index.ts',
    '^@universal/shared-theme-context$': '<rootDir>/../shared-theme-context/src/index.ts',
    '^@universal/shared-a11y$': '<rootDir>/../shared-a11y/src/index.ts',
    '^@universal/shared-i18n$': '<rootDir>/../shared-i18n/src/index.ts',
    '^@universal/shared-design-tokens$': '<rootDir>/../shared-design-tokens/src/index.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
