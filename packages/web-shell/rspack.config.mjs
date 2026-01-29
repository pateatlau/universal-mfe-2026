import rspack from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
const { HtmlRspackPlugin, DefinePlugin } = rspack;
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine mode from NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// Enable logging plugin only in development mode
// Can be disabled by setting ENABLE_MF_LOGGING=false
const enableLogging =
  process.env.ENABLE_MF_LOGGING !== 'false' && isDevelopment;

// Remote URL configuration - use environment variable for production, localhost for development
const remoteHelloUrl = process.env.REMOTE_HELLO_URL || 'http://localhost:9003';

// Firebase configuration from environment variables
// These are safe to expose - security is enforced via Firebase Security Rules
const firebaseConfig = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || '',
};

export default {
  entry: './src/index.tsx',
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  devServer: {
    port: 9001,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // Enable SPA fallback for client-side routing
    historyApiFallback: true,
    // Disable error overlay (interferes with E2E tests)
    client: {
      overlay: false,
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      // Use absolute path to ensure alias works for all imports including transitive deps
      'react-native$': path.resolve(__dirname, 'node_modules/react-native-web'),
      // Force correct react-router resolution (hoisted to root node_modules)
      'react-router': path.resolve(__dirname, '../../node_modules/react-router'),
      'react-router-dom': path.resolve(__dirname, '../../node_modules/react-router-dom'),
    },
    fallback: {
      // Exclude React Native native modules that don't work on web
      '@react-native-async-storage/async-storage': false,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: isDevelopment,
                },
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
    // Define environment variables for Firebase configuration
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.FIREBASE_API_KEY': JSON.stringify(firebaseConfig.FIREBASE_API_KEY),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseConfig.FIREBASE_AUTH_DOMAIN),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(firebaseConfig.FIREBASE_PROJECT_ID),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(firebaseConfig.FIREBASE_STORAGE_BUCKET),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(firebaseConfig.FIREBASE_MESSAGING_SENDER_ID),
      'process.env.FIREBASE_APP_ID': JSON.stringify(firebaseConfig.FIREBASE_APP_ID),
      'process.env.FIREBASE_MEASUREMENT_ID': JSON.stringify(firebaseConfig.FIREBASE_MEASUREMENT_ID),
    }),
    new ModuleFederationPlugin({
      name: 'web_shell',
      remotes: {
        hello_remote: `hello_remote@${remoteHelloUrl}/remoteEntry.js`,
      },
      // Conditionally enable logging plugin (development only, safe to disable)
      // Note: Must use string path, not function reference, for Module Federation to resolve
      runtimePlugins: enableLogging
        ? [
            [
              path.resolve(__dirname, './src/plugins/mf-logging.ts'),
              {
                enabled: true,
                logLevel: 'debug',
                includeTimestamps: true,
              },
            ],
          ]
        : [],
      shared: {
        react: {
          singleton: true,
          requiredVersion: '19.2.0',
          eager: true,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '19.2.0',
          eager: true,
        },
        'react-native-web': {
          singleton: true,
          requiredVersion: '0.21.2',
          eager: true,
        },
        // Core shared packages
        '@universal/shared-utils': { singleton: true, eager: true },
        '@universal/shared-hello-ui': { singleton: true, eager: true },
        // Dependencies used by shared-hello-ui (CRITICAL: must be singletons to avoid
        // multiple instances of Zustand stores and React contexts)
        '@universal/shared-theme-context': { singleton: true, eager: true },
        '@universal/shared-i18n': { singleton: true, eager: true },
        '@universal/shared-auth-store': { singleton: true, eager: true },
        '@universal/shared-a11y': { singleton: true, eager: true },
        // Additional shared packages used by the host
        '@universal/shared-event-bus': { singleton: true, eager: true },
        '@universal/shared-data-layer': { singleton: true, eager: true },
        '@universal/shared-router': { singleton: true, eager: true },
      },
    }),
    new HtmlRspackPlugin({
      template: './public/index.html',
    }),
  ],
};
