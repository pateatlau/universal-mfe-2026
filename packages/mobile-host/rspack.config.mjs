import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';
import path from 'node:path';

const dirname = Repack.getDirname(import.meta.url);
const platform = process.env.PLATFORM || 'android';

// Use different ports for different platforms to allow running both simultaneously
const devServerPort = process.env.PORT || (platform === 'ios' ? 8081 : 8080);

export default {
  context: dirname,

  // Tell Rspack this is a React Native target, not web
  // target: Repack.getTarget(platform),

  entry: {
    index: './src/index',
  },
  output: {
    path: path.join(dirname, 'dist'),
    // Use [name].bundle so "index" -> "index.bundle"
    filename: 'index.bundle',
    // No 'auto' in RN/Hermes
    publicPath: '',
    // clean: true,
    // chunkFilename: '[name].chunk.bundle',
  },
  devServer: {
    port: devServerPort,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    static: {
      directory: path.join(dirname, 'public'),
      publicPath: '/',
    },
  },
  devtool: false, // Disable source maps to avoid copy errors in dev mode
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    // Use Re.Pack's RN resolver so 'react-native' & friends map correctly
    ...Repack.getResolveOptions({
      platform,
      environment: 'react-native',
      enablePackageExports: true,
    }),
    // keep your fallback
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
      platform: platform,
      hermes: true,
    }),
    // Replace React Native dev tools internal modules with empty stubs
    // These modules don't exist in the published React Native package
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
      name: 'MobileHost',
      remotes: {},
      shared: {
        react: {
          singleton: true,
          requiredVersion: '19.2.0',
          eager: true,
        },
        // 'react-native': {
        //   singleton: true,
        //   eager: true,
        //   version: '0.80.0',
        // },
      },
      dts: false,
    }),
  ],
};
