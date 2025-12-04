/**
 * @universal/web-remote-hello
 * 
 * Standalone entry point for the remote.
 * This allows the remote to run independently for development/testing.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { View } from "react-native";
import "./styles.css";
import HelloRemote from "./HelloRemote";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <View className="flex-1 w-full min-h-screen bg-gray-50 items-center justify-center">
      <HelloRemote name="Standalone Remote" />
    </View>
  </React.StrictMode>
);

