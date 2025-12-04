/**
 * @universal/web-shell
 *
 * Web shell application that dynamically loads remote components.
 *
 * Uses React Native Web to render universal RN components.
 */

import React, { Suspense, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StorageDemo } from '@universal/shared-hello-ui';

// Dynamic import of remote - NO static imports allowed
const HelloRemote = React.lazy(() => import('hello_remote/HelloRemote'));

function App() {
  const [pressCount, setPressCount] = useState(0);

  const handlePress = () => {
    setPressCount((prev) => prev + 1);
    console.log('Button pressed!', pressCount + 1);
  };

  return (
    <View className="flex-1 w-full min-h-screen bg-gray-50">
      {/* Header */}
      <View className="p-6 bg-white border-b border-gray-200 shadow-sm">
        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Universal MFE - Web Shell
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Dynamically loading remote component via Module Federation v2
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="p-6 items-center">
          {/* Remote Component Section */}
          <View className="w-full max-w-2xl mb-8">
            <View className="bg-white rounded-lg shadow-md p-6 items-center">
              <Suspense
                fallback={
                  <View className="p-8 items-center">
                    <Text className="text-base text-gray-500">
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
                <View className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Text className="text-sm text-blue-700 font-medium text-center">
                    Button pressed {pressCount} time{pressCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Storage Demo Section */}
          <View className="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden">
            <StorageDemo />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default App;
