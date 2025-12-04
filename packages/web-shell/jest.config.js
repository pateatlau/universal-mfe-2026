/**
 * Jest Configuration for @universal/web-shell
 * 
 * Web package - uses jsdom for DOM simulation
 */

const baseConfig = require('../../jest.config.base.js');
const path = require('path');

module.exports = {
  ...baseConfig,
  displayName: 'web-shell',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^react-native$': 'react-native-web',
  },
};

