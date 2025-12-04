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
import { View, Text, Pressable } from "react-native";
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
    <View className="p-6 items-center justify-center">
      <Text className="text-2xl font-semibold mb-4 text-gray-800">{greeting}</Text>
      {onPress && (
        <Pressable 
          className="bg-blue-500 px-6 py-3 rounded-lg shadow-sm active:bg-blue-600" 
          onPress={onPress}
        >
          <Text className="text-white text-base font-semibold">Press Me</Text>
        </Pressable>
      )}
    </View>
  );
}

