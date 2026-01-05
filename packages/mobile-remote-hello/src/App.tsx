/**
 * @universal/mobile-remote-hello
 *
 * Standalone entry point for the mobile remote.
 * This allows the remote to run independently for development/testing.
 *
 * Displays the same component that is shared to the host, providing
 * a consistent experience for testing the remote in isolation.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HelloRemote from './HelloRemote';

function App() {
  const [pressCount, setPressCount] = useState(0);

  const handlePress = () => {
    setPressCount((prev) => prev + 1);
    console.log('Remote button pressed!', pressCount + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mobile Remote - Standalone Mode</Text>
        <Text style={styles.subtitle}>
          Testing remote component in isolation
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.remoteContainer}>
          <HelloRemote name="Mobile User" onPress={handlePress} />
        </View>

        {pressCount > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              Remote button pressed {pressCount} time
              {pressCount !== 1 ? 's' : ''}
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
