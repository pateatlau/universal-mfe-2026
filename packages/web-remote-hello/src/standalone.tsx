/**
 * @universal/web-remote-hello
 *
 * Standalone entry point for the remote.
 * This allows the remote to run independently for development/testing.
 *
 * Displays the same component that is shared to the shell, providing
 * a consistent experience for testing the remote in isolation.
 */

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { View, Text, StyleSheet } from "react-native";
import HelloRemote from "./HelloRemote";

/**
 * Renders a standalone testing UI for the HelloRemote component that includes a header and a press counter.
 *
 * The component increments an internal press counter each time the remote's action is triggered and displays the total presses when greater than zero.
 *
 * @returns The React element for the standalone testing interface.
 */
function StandaloneApp() {
  const [pressCount, setPressCount] = useState(0);

  const handlePress = () => {
    setPressCount((prev) => prev + 1);
    // Using console.info instead of console.log to satisfy lint rules
    console.info("Remote button pressed!", pressCount + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Web Remote - Standalone Mode</Text>
        <Text style={styles.subtitle}>
          Testing remote component in isolation
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.remoteContainer}>
          <HelloRemote name="Web User" onPress={handlePress} />
        </View>

        {pressCount > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              Remote button pressed {pressCount} time
              {pressCount !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%" as unknown as number,
    minHeight: "100vh" as unknown as number,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 24,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  remoteContainer: {
    width: "100%" as unknown as number,
    alignItems: "center",
  },
  counter: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  counterText: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "500",
  },
});

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <StandaloneApp />
  </React.StrictMode>
);
