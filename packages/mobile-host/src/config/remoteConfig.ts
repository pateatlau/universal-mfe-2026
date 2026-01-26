/**
 * Remote Module Configuration
 *
 * Configures URLs for dynamically loaded remote modules based on environment.
 *
 * Environment Detection:
 * - __DEV__: React Native development mode (true in dev, false in release builds)
 * - Platform.OS: 'android' or 'ios'
 *
 * URL Strategy:
 * - Development: localhost/emulator addresses for local dev server
 * - Production: Deployed remote bundle URL (Firebase Hosting, CDN, etc.)
 */

import { Platform } from 'react-native';

/**
 * Production remote bundle URL
 *
 * SECURITY NOTE: Always use HTTPS in production to prevent MITM attacks
 *
 * Options:
 * - Firebase Hosting: https://your-project.web.app
 * - GitHub Pages: https://username.github.io/repo
 * - Your CDN: https://cdn.yourcompany.com/remotes
 * - ngrok (temp testing): https://abc123.ngrok.io
 */
const PRODUCTION_REMOTE_URL = 'https://universal-mfe.web.app';

/**
 * Validate that production URL uses HTTPS
 */
if (!__DEV__ && !PRODUCTION_REMOTE_URL.startsWith('https://')) {
  throw new Error('[RemoteConfig] Production remote URL must use HTTPS for security');
}

/**
 * Get the remote host URL based on environment and platform
 */
export const getRemoteHost = (): string => {
  // Production builds: use deployed remote
  if (!__DEV__) {
    return PRODUCTION_REMOTE_URL;
  }

  // Development builds: use local dev server with platform-specific addresses
  // Android emulator: 10.0.2.2 maps to host machine's localhost
  // iOS simulator: localhost works directly
  return Platform.OS === 'android' ? 'http://10.0.2.2:9004' : 'http://localhost:9005';
};

/**
 * Get the full URL for a remote module
 */
export const getRemoteModuleUrl = (moduleName: string): string => {
  const baseUrl = getRemoteHost();
  return `${baseUrl}/${moduleName}.container.js.bundle`;
};

/**
 * Get the full URL for a Module Federation expose chunk
 */
export const getExposeChunkUrl = (chunkName: string): string => {
  const baseUrl = getRemoteHost();
  // Re.Pack outputs expose chunks with .index.bundle extension
  return `${baseUrl}/${chunkName}.index.bundle`;
};

/**
 * Configuration object for remote modules
 */
export const REMOTE_CONFIG = {
  production: {
    url: PRODUCTION_REMOTE_URL,
    enabled: !__DEV__,
  },
  development: {
    android: {
      url: 'http://10.0.2.2:9004',
      port: 9004,
    },
    ios: {
      url: 'http://localhost:9005',
      port: 9005,
    },
    enabled: __DEV__,
  },
  modules: {
    HelloRemote: {
      name: 'HelloRemote',
      exposed: {
        './HelloRemote': 'HelloRemote',
      },
    },
  },
} as const;
