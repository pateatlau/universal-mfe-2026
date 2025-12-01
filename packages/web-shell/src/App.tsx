/**
 * @universal/web-shell
 *
 * Web shell application that dynamically loads remote components.
 *
 * Uses React Native Web to render universal RN components.
 */

import React, { Suspense, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Dynamic import of remote - NO static imports allowed
const HelloRemote = React.lazy(() => import('hello_remote/HelloRemote'));

function App() {
  const [pressCount, setPressCount] = useState(0);

  const handlePress = () => {
    setPressCount((prev) => prev + 1);
    console.log('Button pressed!', pressCount + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Universal MFE - Web Shell</Text>
        <Text style={styles.subtitle}>
          Dynamically loading remote component via Module Federation
        </Text>
      </View>

      <View style={styles.content}>
        <Suspense
          fallback={
            <View style={styles.loading}>
              <Text style={styles.loadingText}>
                Loading remote component...
              </Text>
            </View>
          }
        >
          <HelloRemote
            name="Web User"
            onPress={handlePress}
          />
        </Suspense>

        {pressCount > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              Button pressed {pressCount} time{pressCount !== 1 ? 's' : ''}
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
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
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
  loading: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
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
