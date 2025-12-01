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

    new Repack.plugins.ModuleFederationPluginV2({
      name: 'HelloRemote',
      filename: 'HelloRemote.container.js.bundle',
      exposes: {
        './HelloRemote': './src/HelloRemote.tsx',
      },
      shared: {
        react: { singleton: true, eager: true },

        // Let MF handle react-native via the host's share
        'react-native': { singleton: true, eager: true },

        '@universal/shared-utils': { singleton: true, eager: true },
        '@universal/shared-hello-ui': { singleton: true, eager: true },
      },
      dts: false,
    }),
  ],
};

// import * as Repack from '@callstack/repack';
// import rspack from '@rspack/core';
// import path from 'node:path';

// const dirname = Repack.getDirname(import.meta.url);
// const platform = process.env.PLATFORM || 'android';

// export default {
//   context: dirname,
//   mode: 'development',

//   // Entry that bootstraps your remote (can be simple)
//   entry: {
//     // app: './src/main.ts',
//     index: './src/main.ts',
//   },
//   output: {
//     path: path.join(dirname, 'dist'),
//     filename: '[name].js',
//     // filename: '[name].bundle', // Maybe use this?
//     // filename: 'HelloRemote.container.js.bundle',
//     publicPath: '',
//   },

//   devServer: {
//     port: 9004,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     },
//     static: {
//       directory: path.join(dirname, 'public'),
//     },
//   },

//   devtool: false,

//   resolve: {
//     // RN-aware resolution
//     ...Repack.getResolveOptions({
//       platform,
//       environment: 'react-native',
//       enablePackageExports: true,
//     }),

//     extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],

//     fallback: {
//       util: false,
//     },
//   },

//   module: {
//     rules: [
//       ...Repack.getJsTransformRules(),
//       ...Repack.getAssetTransformRules(),
//     ],
//   },

//   plugins: [
//     new Repack.RepackPlugin({
//       // platform: 'android',
//       platform,
//       hermes: true,
//     }),

//     // your devtools stubs – keep as-is
//     new rspack.NormalModuleReplacementPlugin(
//       /devsupport\/rndevtools\/ReactDevToolsSettingsManager/,
//       path.join(dirname, 'src', 'stubs', 'ReactDevToolsSettingsManager.js')
//     ),

//     new rspack.NormalModuleReplacementPlugin(
//       /devsupport\/rndevtools\/specs\/NativeReactDevToolsRuntimeSettingsModule/,
//       path.join(
//         dirname,
//         'src',
//         'stubs',
//         'NativeReactDevToolsRuntimeSettingsModule.js'
//       )
//     ),

//     new Repack.plugins.ModuleFederationPluginV2({
//       // 👇 MUST match what host uses in Federated.importModule + prefetchScript
//       name: 'HelloRemote',

//       // 👇 MUST match ScriptManager resolver URL path
//       filename: 'HelloRemote.container.js.bundle',

//       // 👇 MUST match Federated.importModule('HelloRemote', './HelloRemote', 'default')
//       exposes: {
//         './HelloRemote': './src/HelloRemote.tsx',
//       },

//       shared: {
//         react: {
//           singleton: true,
//           eager: true,
//         },
//         'react-native': {
//           singleton: true,
//           eager: true,
//         },
//         '@universal/shared-utils': {
//           singleton: true,
//           eager: true,
//         },
//         '@universal/shared-hello-ui': {
//           singleton: true,
//           eager: true,
//         },
//       },
//       dts: false,
//     }),
//   ],
// };
