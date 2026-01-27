import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';
import path from 'node:path';
import PatchMFConsolePlugin from './scripts/PatchMFConsolePlugin.mjs';
const dirname = Repack.getDirname(import.meta.url);
const platform = process.env.PLATFORM || 'android';

// Use port 8081 for both iOS and Android to match ReactHost's hardcoded port
// NOTE: This means Android and iOS host bundlers cannot run simultaneously
// This is a temporary workaround until we can properly configure ReactHost
const devServerPort = process.env.PORT || 8081;

export default {
  context: dirname,

  // CRITICAL: Use 'development' mode even for release builds
  // React Native handles minification via Hermes compilation
  // Production mode breaks React Native runtime initialization
  // Dev tools are disabled at native level: Android via BuildConfig.DEBUG, iOS via RCT_DEV=0
  mode: 'development',

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
  // Source maps are required for Hermes compilation in release builds.
  // The Gradle plugin runs compose-source-maps.js which expects the packager to generate source maps.
  // Using 'source-map' for full source map support (required for release builds).
  devtool: 'source-map',
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
    new PatchMFConsolePlugin(),

    // Replace React Native dev tools with stub in production builds
    // This prevents dev tools from being loaded while keeping mode='development'
    ...(process.env.NODE_ENV === 'production' ? [
      new rspack.NormalModuleReplacementPlugin(
        /react-native\/Libraries\/Core\/setUpReactDevTools/,
        path.join(dirname, 'src', 'stubs', 'setUpReactDevTools.js')
      ),
    ] : []),

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
    // Using ModuleFederationPluginV2 for Module Federation 2.0 support
    // MF V2 provides enhanced runtime with better share scope handling
    // Runtime plugins (CorePlugin, ResolverPlugin, PrefetchPlugin) are included by default
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'MobileHost',
      remotes: {}, // Empty - remotes are loaded dynamically via ScriptManager
      // Disable DTS plugin - not compatible with React Native/Hermes environment
      dts: false,
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: '19.1.0',
        },
        'react-native': {
          singleton: true,
          eager: true,
          requiredVersion: '0.80.0',
        },
        '@universal/shared-utils': { singleton: true, eager: true },
        '@universal/shared-hello-ui': { singleton: true, eager: true },
      },
    }),
  ],
};
