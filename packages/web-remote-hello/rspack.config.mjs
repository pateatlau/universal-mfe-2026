import rspack from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
const { HtmlRspackPlugin } = rspack;
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: './src/standalone.tsx',
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    publicPath: 'auto',
  },
  devServer: {
    port: 9003,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      'react-native$': path.resolve(__dirname, 'node_modules/react-native-web'),
      // Replace AsyncStorage with web-compatible stub
      '@react-native-async-storage/async-storage': path.join(
        __dirname,
        './src/stubs/AsyncStorage.js'
      ),
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
    // Replace AsyncStorage with web-compatible stub
    // This handles imports of the package
    new rspack.NormalModuleReplacementPlugin(
      /^@react-native-async-storage\/async-storage$/,
      path.join(__dirname, './src/stubs/AsyncStorage.js')
    ),
    // Handle internal file paths within the package
    new rspack.NormalModuleReplacementPlugin(
      /@react-native-async-storage\/async-storage\/lib\/module/,
      path.join(__dirname, './src/stubs/AsyncStorage.js')
    ),
    new ModuleFederationPlugin({
      name: 'hello_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './HelloRemote': './src/HelloRemote.tsx',
      },
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
        // Dependencies used by shared-hello-ui (must match host's shared config)
        '@universal/shared-theme-context': { singleton: true, eager: true },
        '@universal/shared-i18n': { singleton: true, eager: true },
        '@universal/shared-auth-store': { singleton: true, eager: true },
        '@universal/shared-a11y': { singleton: true, eager: true },
        // Additional shared packages
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
