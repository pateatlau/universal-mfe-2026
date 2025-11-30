import * as Repack from "@callstack/repack";
import rspack from "@rspack/core";
import path from "node:path";

const dirname = Repack.getDirname(import.meta.url);

export default {
  context: dirname,
  entry: {
    app: "./src/main.ts",
  },
  output: {
    path: path.join(dirname, "dist"),
    filename: "[name].js",
    publicPath: "http://localhost:9004/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    fallback: {
      util: false,
    },
  },
  devServer: {
    port: 9004,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    static: {
      directory: path.join(dirname, "public"),
    },
  },
  module: {
    rules: [
      ...Repack.getJsTransformRules(),
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin({ platform: "android" }),
    // Replace React Native dev tools internal modules with empty stubs
    // These modules don't exist in the published React Native package
    new rspack.NormalModuleReplacementPlugin(
      /devsupport\/rndevtools\/ReactDevToolsSettingsManager/,
      path.join(dirname, "src", "stubs", "ReactDevToolsSettingsManager.js")
    ),
    new rspack.NormalModuleReplacementPlugin(
      /devsupport\/rndevtools\/specs\/NativeReactDevToolsRuntimeSettingsModule/,
      path.join(dirname, "src", "stubs", "NativeReactDevToolsRuntimeSettingsModule.js")
    ),
    new Repack.plugins.ModuleFederationPluginV2({
      name: "HelloRemote",
      filename: "HelloRemote.container.js.bundle",
      exposes: {
        "./HelloRemote": "./src/HelloRemote.tsx",
      },
      shared: {
        react: { singleton: true },
        "react-native": { singleton: true },
        "@universal/shared-utils": { singleton: true },
        "@universal/shared-hello-ui": { singleton: true },
      },
      dts: false,
    }),
  ],
};

