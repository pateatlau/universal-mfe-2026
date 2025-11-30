import { defineConfig } from "@rspack/core";
import { ModuleFederationPlugin } from "@rspack/core";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: "./src/index.ts",
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    port: 9003,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    alias: {
      "react-native": "react-native-web",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              transform: {
                react: {
                  runtime: "automatic",
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
      name: "hello_remote",
      filename: "remoteEntry.js",
      exposes: {
        "./HelloRemote": "./src/HelloRemote.tsx",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "19.2.0",
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "19.2.0",
        },
        "react-native-web": {
          singleton: true,
          requiredVersion: "0.21.2",
        },
        "@universal/shared-utils": {
          singleton: true,
        },
        "@universal/shared-hello-ui": {
          singleton: true,
        },
      },
    }),
  ],
});

