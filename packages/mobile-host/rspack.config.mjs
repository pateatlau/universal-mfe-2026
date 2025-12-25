import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';
import path from 'node:path';

const dirname = Repack.getDirname(import.meta.url);
const platform = process.env.PLATFORM || 'android';

// Use port 8081 for both iOS and Android to match ReactHost's hardcoded port
// NOTE: This means Android and iOS host bundlers cannot run simultaneously
// This is a temporary workaround until we can properly configure ReactHost
const devServerPort = process.env.PORT || 8081;

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
    // Configure MIME types for bundle files
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      // Set correct MIME type for .bundle files
      devServer.app?.get('*.bundle', (req, res, next) => {
        res.setHeader('Content-Type', 'application/javascript');
        next();
      });
      return middlewares;
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
          eager: true,
        },
        'react-native': {
          singleton: true,
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
      dts: false,
    }),
  ],
};
