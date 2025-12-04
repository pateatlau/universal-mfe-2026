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
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { ScriptManager, Federated } from '@callstack/repack/client';
import { StorageDemo } from '@universal/shared-hello-ui';

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

  // 1 Main container bundle for the remote
  if (scriptId === 'HelloRemote') {
    const url = `${REMOTE_HOST}/HelloRemote.container.js.bundle`;
    console.log('[ScriptManager resolver] resolved URL for HelloRemote:', url);
    return { url };
  }

  // 2 MFv2 expose chunk for HelloRemote
  if (scriptId === '__federation_expose_HelloRemote') {
    const url = `${REMOTE_HOST}/__federation_expose_HelloRemote.bundle`;
    console.log(
      '[ScriptManager resolver] resolved URL for __federation_expose_HelloRemote:',
      url
    );
    return { url };
  }

  // 3 (Optional) catch-all for future expose chunks
  if (scriptId.startsWith('__federation_expose_')) {
    const url = `${REMOTE_HOST}/${scriptId}.bundle`;
    console.log(
      '[ScriptManager resolver] resolved URL for generic expose chunk:',
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
    <View className="flex-1" style={{ backgroundColor: '#f5f5f5' }}>
      <View 
        className="bg-white items-center"
        style={{ 
          padding: 24, 
          paddingTop: 60, 
          borderBottomWidth: 1, 
          borderBottomColor: '#e0e0e0' 
        }}
      >
        <Text className="text-2xl font-bold" style={{ color: '#333', marginBottom: 8 }}>
          Universal MFE - Mobile Host
        </Text>
        <Text className="text-sm text-center" style={{ color: '#666' }}>
          Dynamically loading remote via ScriptManager + MFv2
        </Text>
      </View>

      <ScrollView className="flex-1" style={{ padding: 24 }}>
        <View className="items-center">
          {!HelloRemote && !state.loading && (
            <Pressable
              className="rounded-lg"
              style={{ 
                backgroundColor: '#007AFF', 
                paddingHorizontal: 24, 
                paddingVertical: 12, 
                marginBottom: 24 
              }}
              onPress={loadRemote}
            >
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                Load Remote Component
              </Text>
            </Pressable>
          )}

          {state.loading && (
            <View className="items-center" style={{ padding: 24 }}>
              <ActivityIndicator
                size="large"
                color="#007AFF"
              />
              <Text className="text-base" style={{ marginTop: 12, color: '#999' }}>
                Loading remote component...
              </Text>
            </View>
          )}

          {state.error && (
            <View className="items-center" style={{ padding: 24 }}>
              <Text className="text-sm text-center" style={{ color: '#d32f2f', marginBottom: 12 }}>
                Error: {state.error}
              </Text>
              <Pressable
                className="rounded-lg"
                style={{ 
                  backgroundColor: '#d32f2f', 
                  paddingHorizontal: 20, 
                  paddingVertical: 10 
                }}
                onPress={loadRemote}
              >
                <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                  Retry
                </Text>
              </Pressable>
            </View>
          )}

          {HelloRemote && (
            <View className="items-center" style={{ width: '100%' }}>
              <HelloRemote
                name="Mobile User"
                onPress={handleRemotePress}
              />
            </View>
          )}

          {state.pressCount > 0 && (
            <View 
              className="rounded-lg"
              style={{ 
                marginTop: 24, 
                padding: 12, 
                backgroundColor: '#e3f2fd' 
              }}
            >
              <Text className="text-sm font-medium" style={{ color: '#1976d2' }}>
                Remote button pressed {state.pressCount} time
                {state.pressCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Storage Demo Section */}
          <View className="mt-8 w-full bg-white rounded-lg" style={{ padding: 16, marginTop: 32 }}>
            <StorageDemo />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default App;
