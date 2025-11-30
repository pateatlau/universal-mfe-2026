/**
 * @universal/shared-hello-ui
 * 
 * Universal React Native UI component.
 * 
 * Constraints:
 * - MUST use React Native primitives only (View, Text, Pressable, etc.)
 * - NO DOM elements (<div>, <span>, <button>, etc.)
 * - NO platform-specific code (except Platform.select)
 * - NO host-specific dependencies
 * - Can import from @universal/shared-utils
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { getGreeting } from "@universal/shared-utils";

export interface HelloUniversalProps {
  name?: string;
  onPress?: () => void;
}

/**
 * Universal Hello component using React Native primitives.
 * 
 * This component can be rendered:
 * - On web via React Native Web (RNW)
 * - On mobile via React Native (RN)
 * 
 * Uses only RN primitives: View, Text, Pressable
 */
export function HelloUniversal({ name, onPress }: HelloUniversalProps) {
  const greeting = getGreeting(name);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{greeting}</Text>
      {onPress && (
        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Press Me</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

