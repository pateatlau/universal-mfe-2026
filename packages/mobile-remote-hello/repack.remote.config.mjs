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
    // This should import your HelloRemote component somewhere
    index: './src/main.ts', // or "./src/index.ts" if that's your main entry
  },

  output: {
    path: path.join(dirname, 'dist'),
    // RN-style entry bundle; we don't care much about this one
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
      // directory: path.join(dirname, 'public'),
      directory: path.join(dirname, 'dist'),
      // publicPath: '/',
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
    // Map @swc/helpers internal paths
    // React Native code uses paths like @swc/helpers/_/_call_super
    // These need to be resolved to the actual helper functions
    // Using a regex-like pattern isn't supported in alias, so we'll use a plugin instead
    alias: {},
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

    // Fix @swc/helpers internal path imports
    // React Native code imports @swc/helpers/_/_* but these paths aren't directly exported
    // Replace with the correct cjs path that exports { _ }
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

    // keep your RN devtools stubs
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
    // Remote modules use eager: false to defer loading until host initializes share scope
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'HelloRemote',
      filename: 'HelloRemote.container.js.bundle',
      // Disable DTS plugin - not compatible with React Native/Hermes environment
      dts: false,
      exposes: {
        './HelloRemote': './src/HelloRemote.tsx',
      },
      shared: {
        react: {
          singleton: true,
          eager: false, // Remote defers to host's eager loading
          requiredVersion: '19.1.0',
        },
        'react-native': {
          singleton: true,
          eager: false, // Remote defers to host's eager loading
          requiredVersion: '0.80.0',
        },
        '@universal/shared-utils': { singleton: true, eager: false },
        '@universal/shared-hello-ui': { singleton: true, eager: false },
      },
    }),
  ],
};
