/**
 * Jest configuration for @universal/shared-auth-store
 */

const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  displayName: 'shared-auth-store',
  testEnvironment: 'node',
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@universal/shared-utils$': '<rootDir>/../shared-utils/src',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          lib: ['ES2020', 'DOM'],
        },
      },
    ],
  },
};
