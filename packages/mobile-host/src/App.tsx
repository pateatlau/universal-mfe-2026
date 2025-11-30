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

// Initialize ScriptManager BEFORE any remote imports
// const REMOTE_HOST =
//   Platform.OS === 'android'
//     ? 'http://10.0.2.2:9004' // Android emulator → host machine
//     : 'http://localhost:9004'; // iOS simulator → host machine
const REMOTE_HOST =
  Platform.OS === 'android'
    ? 'http://192.168.0.104:9004' // Android emulator → host machine
    : 'http://localhost:9004'; // iOS simulator → host machine
// const REMOTE_HTTP_BASE = `${REMOTE_BASE_HOST}`;
// const MANIFEST_URL = `${REMOTE_HTTP_BASE}/mf-manifest.json`;
// async function resolveHelloRemoteUrl() {
//   if (!res.ok) {
//     throw new Error(
//       `[Manifest] Failed to fetch mf-manifest.json: ${res.status} ${res.statusText}`
//     );
//   }

//   const manifest = await res.json();
//   console.log('[ScriptManager] Manifest loaded:', manifest);
//   ///////////////

//   const meta = manifest.metaData || {};
//   let publicPath: string = meta.publicPath || REMOTE_HTTP_BASE;
//   const remoteEntryName: string =
//     (meta.remoteEntry && meta.remoteEntry.name) || 'remoteEntry.js';

//   // Normalize publicPath
//   if (!publicPath.startsWith('http')) {
//     publicPath = `${REMOTE_HTTP_BASE.replace(/\/$/, '')}/${publicPath.replace(
//       /^\//,
//       ''
//     )}`;
//   }

//   if (!publicPath.endsWith('/')) {
//     publicPath += '/';
//   }

//   let url = publicPath + remoteEntryName;

//   // Patch localhost → emulator host if needed
//   if (url.startsWith('http://localhost:9004')) {
//     url = url.replace('http://localhost:9004', REMOTE_HTTP_BASE);
//   }

//   console.log('[ScriptManager] Resolved HelloRemote URL:', url);
//   return url;
//   // Try common shapes
//   // const mfEntry =
//   //   manifest.remotes?.HelloRemote ||
//   //   manifest.containers?.HelloRemote ||
//   //   manifest['HelloRemote'];

//   // if (!mfEntry) {
//   //   throw new Error('[Manifest] HelloRemote not found in mf-manifest.json');
//   // }

//   // let url: string =
//   //   mfEntry.entry || mfEntry.url || mfEntry.container || mfEntry;

//   // if (typeof url !== 'string') {
//   //   throw new Error(
//   //     `[Manifest] Could not resolve entry URL for HelloRemote from manifest entry: ${JSON.stringify(
//   //       mfEntry
//   //     )}`
//   //   );
//   // }

//   // // Patch host for emulator
//   // if (url.startsWith('http://localhost:9004')) {
//   //   url = url.replace('http://localhost:9004', REMOTE_HTTP_BASE);
//   // } else if (url.startsWith('/')) {
//   //   url = `${REMOTE_HTTP_BASE}${url}`;
//   // }

//   // console.log('[ScriptManager] Resolved HelloRemote URL:', url);
//   // return url;
// }

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  console.log('[ScriptManager resolver]', { scriptId, caller });

  // 1️⃣ Main container bundle for the remote
  if (scriptId === 'HelloRemote') {
    const url = `${REMOTE_HOST}/HelloRemote.container.js.bundle`;
    console.log('[ScriptManager resolver] resolved URL for HelloRemote:', url);
    return { url };
  }

  // 2️⃣ MFv2 expose chunk for HelloRemote
  if (scriptId === '__federation_expose_HelloRemote') {
    // We saw this file in dist, so map directly to it:
    const url = `${REMOTE_HOST}/__federation_expose_HelloRemote.bundle`;
    console.log(
      '[ScriptManager resolver] resolved URL for __federation_expose_HelloRemote:',
      url
    );
    return { url };
  }

  // 3️⃣ (Optional) catch-all for future expose chunks
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
  // console.log('[ScriptManager resolver] scriptId:', scriptId);
  // console.log('[ScriptManager resolver] caller:', caller);

  // switch (scriptId) {
  //   case 'HelloRemote':
  //     // const url = await resolveHelloRemoteUrl();
  //     const url = `${REMOTE_HOST}/HelloRemote.container.js.bundle`;
  //     console.log('[ScriptManager resolver] resolved URL:', url);
  //     return { url };
  //   default:
  //     throw new Error(`Unknown scriptId: ${scriptId}`);
  // }
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
        {!HelloRemote && !state.loading && (
          <Pressable
            style={styles.loadButton}
            onPress={loadRemote}
          >
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
