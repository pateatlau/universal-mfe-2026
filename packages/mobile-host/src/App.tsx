/**
 * @universal/mobile-host
 *
 * Mobile host application that dynamically loads remote components.
 *
 * Uses ScriptManager + Module Federation v2 for dynamic remote loading.
 * Hermes is required for execution.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ScriptManager, Federated } from '@callstack/repack/client';

// Platform-specific remote host configuration
// Android uses port 9004, iOS uses port 9005 to allow simultaneous testing
// Use a function to ensure Platform is available when called
const getRemoteHost = () => {
  if (Platform && Platform.OS) {
    return Platform.OS === 'android'
      ? // Android emulator → host machine
        'http://10.0.2.2:9004'
      : // iOS simulator → localhost (uses separate port 9005)
        'http://localhost:9005';
  }
  // Fallback: assume iOS if Platform not available (for initial load)
  return 'http://localhost:9005';
};

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  console.log('[ScriptManager resolver]', { scriptId, caller });

  const REMOTE_HOST = getRemoteHost();

  // 1. Main container bundle for the remote
  if (scriptId === 'HelloRemote') {
    const url = `${REMOTE_HOST}/HelloRemote.container.js.bundle`;
    console.log('[ScriptManager resolver] resolved URL for HelloRemote:', url);
    return { url };
  }

  // 2. MF V2 expose chunks (e.g., __federation_expose_HelloRemote)
  // Re.Pack outputs these with .index.bundle extension
  if (scriptId.startsWith('__federation_expose_')) {
    const url = `${REMOTE_HOST}/${scriptId}.index.bundle`;
    console.log(
      '[ScriptManager resolver] resolved URL for federation expose chunk:',
      scriptId,
      url
    );
    return { url };
  }

  // 3. All other chunks requested by HelloRemote container
  // This handles async chunks like vendors-*, src_*, etc.
  // Re.Pack outputs these with .index.bundle extension
  if (caller === 'HelloRemote') {
    const url = `${REMOTE_HOST}/${scriptId}.index.bundle`;
    console.log(
      '[ScriptManager resolver] resolved URL for HelloRemote chunk:',
      scriptId,
      url
    );
    return { url };
  }

  throw new Error(`Unknown scriptId: ${scriptId}`);
});

interface AppState {
  remoteComponent: React.ComponentType<any> | null;
  loading: boolean;
  error: string | null;
  pressCount: number;
}

function App() {
  const [state, setState] = useState<AppState>({
    remoteComponent: null,
    loading: false,
    error: null,
    pressCount: 0,
  });

  const loadRemote = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Prefetch the remote bundle (optional but recommended)
      await ScriptManager.shared.prefetchScript('HelloRemote');

      // Dynamically import the remote module using MFv2
      const RemoteModule = await Federated.importModule(
        'HelloRemote',
        './HelloRemote',
        'default'
      );

      // Extract the default export (HelloRemote component)
      const HelloRemote = RemoteModule.default || RemoteModule;

      setState((prev) => ({
        ...prev,
        remoteComponent: HelloRemote,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load remote:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  const handleRemotePress = () => {
    setState((prev) => ({ ...prev, pressCount: prev.pressCount + 1 }));
    console.log('Remote button pressed!', state.pressCount + 1);
  };

  const HelloRemote = state.remoteComponent;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Universal MFE - Mobile Host</Text>
        <Text style={styles.subtitle}>
          Dynamically loading remote via ScriptManager + MFv2
        </Text>
      </View>

      <View style={styles.content}>
        {!HelloRemote && !state.loading && !state.error && (
          <Pressable style={styles.loadButton} onPress={loadRemote}>
            <Text style={styles.loadButtonText}>Load Remote Component</Text>
          </Pressable>
        )}

        {state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color="#007AFF"
            />
            <Text style={styles.loadingText}>Loading remote component...</Text>
          </View>
        )}

        {state.error && (
          <View style={styles.error}>
            <Text style={styles.errorText}>Error: {state.error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={loadRemote}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {HelloRemote && (
          <View style={styles.remoteContainer}>
            <HelloRemote
              name="Mobile User"
              onPress={handleRemotePress}
            />
          </View>
        )}

        {state.pressCount > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              Remote button pressed {state.pressCount} time
              {state.pressCount !== 1 ? 's' : ''}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  loadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  error: {
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  remoteContainer: {
    width: '100%',
    alignItems: 'center',
  },
  counter: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  counterText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
});

export default App;
