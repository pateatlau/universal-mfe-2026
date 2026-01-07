/**
 * RemoteLoadingFallback
 *
 * A themed loading component to display while a remote MFE is being loaded.
 * Uses React Native primitives for universal rendering.
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface RemoteLoadingFallbackProps {
  /** Custom loading message */
  message?: string;
  /** Size of the activity indicator */
  size?: 'small' | 'large';
  /** Color of the activity indicator */
  color?: string;
  /** Custom styles for the container */
  containerStyle?: ViewStyle;
  /** Custom styles for the message text */
  messageStyle?: TextStyle;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

/**
 * Default loading fallback component for remote MFEs.
 *
 * Usage:
 * ```tsx
 * <RemoteLoadingFallback message="Loading remote module..." />
 * ```
 */
export function RemoteLoadingFallback({
  message = 'Loading...',
  size = 'large',
  color = '#007AFF',
  containerStyle,
  messageStyle,
}: RemoteLoadingFallbackProps): React.ReactElement {
  return (
    <View
      style={[styles.container, containerStyle]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size={size} color={color} />
      <Text style={[styles.message, messageStyle]}>{message}</Text>
    </View>
  );
}

export default RemoteLoadingFallback;
