/**
 * Jest Configuration for @universal/web-remote-hello
 * 
 * Web remote package - uses jsdom for DOM simulation
 */

const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  displayName: 'web-remote-hello',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^react-native$': 'react-native-web',
  },
};

