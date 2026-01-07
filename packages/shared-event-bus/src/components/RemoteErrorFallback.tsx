/**
 * RemoteErrorFallback
 *
 * A themed error component to display when a remote MFE fails to load or render.
 * Provides a retry button and displays error information.
 * Uses React Native primitives for universal rendering.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface RemoteErrorFallbackProps {
  /** The error that occurred */
  error: Error | string;
  /** Name of the remote module that failed */
  remoteName?: string;
  /** Callback to retry loading the remote */
  onRetry?: () => void;
  /** Whether to show the full error message (default: true in dev, false in prod) */
  showErrorDetails?: boolean;
  /** Custom error title */
  title?: string;
  /** Custom retry button text */
  retryText?: string;
  /** Custom styles for the container */
  containerStyle?: ViewStyle;
  /** Custom styles for the title text */
  titleStyle?: TextStyle;
  /** Custom styles for the error message text */
  errorStyle?: TextStyle;
  /** Custom styles for the retry button */
  retryButtonStyle?: ViewStyle;
  /** Custom styles for the retry button text */
  retryButtonTextStyle?: TextStyle;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  remoteName: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
});

/**
 * Default error fallback component for remote MFEs.
 *
 * Usage:
 * ```tsx
 * <RemoteErrorFallback
 *   error={error}
 *   remoteName="HelloRemote"
 *   onRetry={() => loadRemote()}
 * />
 * ```
 */
export function RemoteErrorFallback({
  error,
  remoteName,
  onRetry,
  showErrorDetails,
  title = 'Failed to load module',
  retryText = 'Retry',
  containerStyle,
  titleStyle,
  errorStyle,
  retryButtonStyle,
  retryButtonTextStyle,
}: RemoteErrorFallbackProps): React.ReactElement {
  // Default to showing error details in development
  const shouldShowDetails =
    showErrorDetails ?? process.env.NODE_ENV !== 'production';

  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <View
      style={[styles.container, containerStyle]}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${title}`}
    >
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {remoteName && (
        <Text style={styles.remoteName}>Module: {remoteName}</Text>
      )}

      {shouldShowDetails && (
        <Text style={[styles.errorMessage, errorStyle]}>{errorMessage}</Text>
      )}

      {onRetry && (
        <Pressable
          style={[styles.retryButton, retryButtonStyle]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryText}
          accessibilityHint="Tap to retry loading the module"
        >
          <Text style={[styles.retryButtonText, retryButtonTextStyle]}>
            {retryText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default RemoteErrorFallback;
