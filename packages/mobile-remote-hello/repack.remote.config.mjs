import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';
import path from 'node:path';

const dirname = Repack.getDirname(import.meta.url);
const platform = process.env.PLATFORM || 'android';
// Use separate ports for Android (9004) and iOS (9005) to allow simultaneous testing
const devServerPort = platform === 'ios' ? 9005 : 9004;

export default {
  context: dirname,
  mode: 'development',

  entry: {
    index: './src/main.ts',
  },

  output: {
    path: path.join(dirname, 'dist'),
    filename: 'index.bundle',
    publicPath: '',
  },

  devServer: {
    port: devServerPort,
    host: '0.0.0.0',
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    static: {
      directory: path.join(dirname, 'dist'),
    },
  },

  devtool: false,

  resolve: {
    ...Repack.getResolveOptions({
      platform,
      environment: 'react-native',
      enablePackageExports: true,
    }),
    fallback: {
      util: false,
    },
  },

  module: {
    rules: [
      ...Repack.getJsTransformRules(),
      ...Repack.getAssetTransformRules(),
    ],
  },

  plugins: [
    new Repack.RepackPlugin({
      platform,
      hermes: true,
    }),

    // Replace React Native dev tools internal modules with empty stubs
    new rspack.NormalModuleReplacementPlugin(
      /devsupport\/rndevtools\/ReactDevToolsSettingsManager/,
      path.join(dirname, 'src', 'stubs', 'ReactDevToolsSettingsManager.js')
    ),
    new rspack.NormalModuleReplacementPlugin(
      /devsupport\/rndevtools\/specs\/NativeReactDevToolsRuntimeSettingsModule/,
      path.join(
        dirname,
        'src',
        'stubs',
        'NativeReactDevToolsRuntimeSettingsModule.js'
      )
    ),

    new Repack.plugins.ModuleFederationPluginV2({
      name: 'HelloRemote',
      filename: 'HelloRemote.container.js.bundle',
      exposes: {
        './HelloRemote': './src/HelloRemote.tsx',
      },
      shared: {
        react: { singleton: true, eager: true },

        'react-native': { singleton: true, eager: true },

        '@universal/shared-utils': { singleton: true, eager: true },
        '@universal/shared-hello-ui': { singleton: true, eager: true },
      },
      dts: false,
    }),
  ],
};
