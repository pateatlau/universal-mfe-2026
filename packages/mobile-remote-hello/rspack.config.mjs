/**
 * @universal/mobile-remote-hello
 *
 * Rspack configuration for standalone mode.
 * This config bundles the app as an independent React Native application,
 * WITHOUT Module Federation (no remote sharing).
 *
 * Used for: Running mobile-remote-hello as a standalone "super app"
 */

import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';
import path from 'node:path';

const dirname = Repack.getDirname(import.meta.url);
const platform = process.env.PLATFORM || 'android';

// Standalone ports: Android 8083, iOS 8084
// (Different from host ports 8081/8082 and remote ports 9004/9005)
const devServerPort = platform === 'ios' ? 8084 : 8083;

export default {
  context: dirname,
  mode: 'development',

  entry: {
    index: './src/main.ts',
  },

  output: {
    path: path.join(dirname, 'dist', 'standalone', platform),
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
      directory: path.join(dirname, 'dist', 'standalone', platform),
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      // Metro compatibility: React Native checks /status to see if packager is running
      devServer.app?.get('/status', (_req, res) => {
        res.send('packager-status:running');
      });
      devServer.app?.get('*.bundle', (req, res, next) => {
        res.setHeader('Content-Type', 'application/javascript');
        next();
      });
      return middlewares;
    },
  },

  // Source maps are required for Hermes compilation in release builds.
  // The Gradle plugin runs compose-source-maps.js which expects the packager to generate source maps.
  devtool: 'source-map',

  resolve: {
    ...Repack.getResolveOptions({
      platform,
      environment: 'react-native',
      enablePackageExports: true,
    }),
    // Platform-specific extensions must be first for correct resolution
    // (e.g., Platform.android.js should be resolved before Platform.js)
    // These OVERRIDE the Repack extensions because spread comes first
    extensions: [
      `.${platform}.tsx`,
      `.${platform}.ts`,
      `.${platform}.jsx`,
      `.${platform}.js`,
      '.native.tsx',
      '.native.ts',
      '.native.jsx',
      '.native.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      `.${platform}.json`,
      '.native.json',
      '.json',
    ],
    fallback: {
      util: false,
    },
  },

  module: {
    rules: [...Repack.getJsTransformRules(), ...Repack.getAssetTransformRules()],
  },

  plugins: [
    new Repack.RepackPlugin({
      platform,
      hermes: true,
    }),

    // Fix @swc/helpers internal path imports
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_call_super$/,
      '@swc/helpers/cjs/_call_super.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_class_call_check$/,
      '@swc/helpers/cjs/_class_call_check.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_create_class$/,
      '@swc/helpers/cjs/_create_class.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_define_property$/,
      '@swc/helpers/cjs/_define_property.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_get$/,
      '@swc/helpers/cjs/_get.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_get_prototype_of$/,
      '@swc/helpers/cjs/_get_prototype_of.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_inherits$/,
      '@swc/helpers/cjs/_inherits.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_possible_constructor_return$/,
      '@swc/helpers/cjs/_possible_constructor_return.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_set$/,
      '@swc/helpers/cjs/_set.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_set_prototype_of$/,
      '@swc/helpers/cjs/_set_prototype_of.cjs'
    ),
    new rspack.NormalModuleReplacementPlugin(
      /^@swc\/helpers\/_\/_to_consumable_array$/,
      '@swc/helpers/cjs/_to_consumable_array.cjs'
    ),

    // RN devtools stubs
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

    // NO Module Federation plugin - this is a standalone app
  ],
};
