import rspack from "@rspack/core";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
const { HtmlRspackPlugin } = rspack;
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createLoggingPlugin } from "./src/plugins/mf-logging.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enable logging plugin only in development mode
// Can be disabled by setting ENABLE_MF_LOGGING=false
const isDevelopment = process.env.NODE_ENV === "development";
const enableLogging = process.env.ENABLE_MF_LOGGING !== "false" && isDevelopment;

export default {
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
      // Conditionally enable logging plugin (development only, safe to disable)
      runtimePlugins: enableLogging
        ? [
            [
              createLoggingPlugin,
              {
                enabled: true,
                logLevel: "debug",
                includeTimestamps: true,
              },
            ],
          ]
        : [],
      shared: {
        react: {
          singleton: true,
          requiredVersion: "19.2.0",
          eager: true,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "19.2.0",
          eager: true,
        },
        "react-native-web": {
          singleton: true,
          requiredVersion: "0.21.2",
          eager: true,
        },
      },
    }),
    new HtmlRspackPlugin({
      template: "./public/index.html",
    }),
  ],
};

