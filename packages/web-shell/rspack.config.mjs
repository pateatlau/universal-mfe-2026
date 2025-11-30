import { defineConfig } from "@rspack/core";
import { ModuleFederationPlugin } from "@rspack/core";
import HtmlRspackPlugin from "@rspack/plugin-html";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: "./src/index.tsx",
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    port: 9001,
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
      name: "web_shell",
      remotes: {
        hello_remote: "hello_remote@http://localhost:9003/remoteEntry.js",
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
      },
    }),
    new HtmlRspackPlugin({
      template: "./public/index.html",
    }),
  ],
});

