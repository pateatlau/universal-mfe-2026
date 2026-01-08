import rspack from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
const { HtmlRspackPlugin } = rspack;
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enable logging plugin only in development mode
// Can be disabled by setting ENABLE_MF_LOGGING=false
const isDevelopment = process.env.NODE_ENV === 'development';
const enableLogging =
  process.env.ENABLE_MF_LOGGING !== 'false' && isDevelopment;

// Remote URL configuration - use environment variable for production, localhost for development
const remoteHelloUrl = process.env.REMOTE_HELLO_URL || 'http://localhost:9003';

export default {
  entry: './src/index.tsx',
  mode: 'development',
  devtool: 'eval-source-map',
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
                },
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
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
      },
    }),
    new HtmlRspackPlugin({
      template: './public/index.html',
    }),
  ],
};
