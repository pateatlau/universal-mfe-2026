import rspack from '@rspack/core';
const { ModuleFederationPlugin } = rspack.container;
const { HtmlRspackPlugin } = rspack;
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: './src/standalone.tsx',
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    port: 9003,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      'react-native': 'react-native-web',
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
        '@universal/shared-utils': {
          singleton: true,
          eager: true,
        },
        '@universal/shared-hello-ui': {
          singleton: true,
          eager: true,
        },
      },
    }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'HelloRemote',
      filename: 'HelloRemote.container.js.bundle',
      exposes: {
        './HelloRemote': './src/HelloRemote',
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: pkg.dependencies.react,
        },
        'react-native': {
          singleton: true,
          eager: true,
          requiredVersion: pkg.dependencies['react-native'],
        },
      },
    }),
    new HtmlRspackPlugin({
      template: './public/index.html',
    }),
  ],
};
