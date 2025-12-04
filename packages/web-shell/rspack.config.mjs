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

export default {
  entry: './src/index.tsx',
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    port: 9001,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      'react-native': 'react-native-web',
      // Resolve shared packages - point to package root so Module Federation can read package.json for version
      '@universal/shared-hello-ui': path.resolve(
        __dirname,
        '../shared-hello-ui'
      ),
      '@universal/shared-utils': path.resolve(__dirname, '../shared-utils'),
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
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, 'postcss.config.js'),
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // Replace AsyncStorage with stub for web builds - it's React Native only
    // This must come BEFORE ModuleFederationPlugin to ensure it processes first
    // Match both the package and any internal imports
    new rspack.NormalModuleReplacementPlugin(
      /^@react-native-async-storage\/async-storage/,
      path.resolve(__dirname, './src/stubs/async-storage.js')
    ),
    new ModuleFederationPlugin({
      name: 'web_shell',
      remotes: {
        hello_remote: 'hello_remote@http://localhost:9003/remoteEntry.js',
      },
      // Conditionally enable logging plugin (development only, safe to disable)
      // Runtime plugins must be file paths (strings), not function references
      runtimePlugins: enableLogging
        ? [
            [
              './src/plugins/mf-logging.ts',
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
        '@universal/shared-utils': {
          singleton: true,
          eager: true,
          requiredVersion: '0.1.0', // Match package.json version
          // No import - let Module Federation resolve via alias to read version from package.json
        },
        '@universal/shared-hello-ui': {
          singleton: true,
          eager: true,
          requiredVersion: '0.1.0', // Match package.json version
          // No import - let Module Federation resolve via alias to read version from package.json
        },
      },
    }),
    new HtmlRspackPlugin({
      template: './public/index.html',
    }),
  ],
};
