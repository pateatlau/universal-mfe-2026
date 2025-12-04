/**
 * @universal/shared-hello-ui
 * 
 * Storage demo component demonstrating cross-platform storage usage.
 * 
 * This component uses the storage utilities from @universal/shared-utils
 * which automatically uses localStorage on web and AsyncStorage on mobile.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { setString, getString, setJSON, getJSON } from '@universal/shared-utils';

export function StorageDemo() {
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [storedObject, setStoredObject] = useState<{ name: string; count: number } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [objectName, setObjectName] = useState('');
  const [objectCount, setObjectCount] = useState('0');

  // Load stored values on mount
  useEffect(() => {
    loadStoredValues();
  }, []);

  const loadStoredValues = async () => {
    try {
      // Load string value
      const value = await getString('demo-string-key');
      setStoredValue(value);

      // Load JSON object
      const obj = await getJSON<{ name: string; count: number }>('demo-json-key');
      setStoredObject(obj);
    } catch (error) {
      console.error('Error loading stored values:', error);
    }
  };

  const handleSaveString = async () => {
    try {
      await setString('demo-string-key', inputValue);
      setStoredValue(inputValue);
      setInputValue('');
      console.log('String saved successfully');
    } catch (error) {
      console.error('Error saving string:', error);
    }
  };

  const handleSaveObject = async () => {
    try {
      const obj = {
        name: objectName,
        count: parseInt(objectCount, 10) || 0,
      };
      await setJSON('demo-json-key', obj);
      setStoredObject(obj);
      setObjectName('');
      setObjectCount('0');
      console.log('Object saved successfully');
    } catch (error) {
      console.error('Error saving object:', error);
    }
  };

  const handleClear = async () => {
    try {
      const storageModule = await import('@universal/shared-utils');
      const storage = (storageModule as any).storage;
      if (storage) {
        await storage.removeItem('demo-string-key');
        await storage.removeItem('demo-json-key');
      }
      setStoredValue(null);
      setStoredObject(null);
      setInputValue('');
      setObjectName('');
      setObjectCount('0');
      console.log('Storage cleared');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  return (
    <View className="p-6">
      <Text className="text-2xl font-bold mb-2 text-gray-900">Storage Demo</Text>
      <Text className="text-sm mb-6 text-gray-600">
        This component demonstrates cross-platform storage:
        {'\n'}• Web: Uses localStorage
        {'\n'}• Mobile: Uses AsyncStorage
      </Text>

      {/* String Storage Section */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-3 text-gray-800">String Storage</Text>
        <View className="mb-3">
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 text-gray-900 bg-white"
            placeholder="Enter a string value"
            value={inputValue}
            onChangeText={setInputValue}
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 }}
          />
          <Pressable
            className="bg-blue-500 px-4 py-3 rounded-lg shadow-sm active:bg-blue-600"
            onPress={handleSaveString}
          >
            <Text className="text-white font-semibold text-center">Save String</Text>
          </Pressable>
        </View>
        {storedValue !== null && (
          <View className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Text className="text-sm text-blue-900">Stored: <Text className="font-semibold">{storedValue}</Text></Text>
          </View>
        )}
      </View>

      {/* JSON Object Storage Section */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-3 text-gray-800">JSON Object Storage</Text>
        <View className="mb-3">
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 text-gray-900 bg-white"
            placeholder="Enter name"
            value={objectName}
            onChangeText={setObjectName}
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 }}
          />
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 text-gray-900 bg-white"
            placeholder="Enter count"
            value={objectCount}
            onChangeText={setObjectCount}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 }}
          />
          <Pressable
            className="bg-green-500 px-4 py-3 rounded-lg shadow-sm active:bg-green-600"
            onPress={handleSaveObject}
          >
            <Text className="text-white font-semibold text-center">Save Object</Text>
          </Pressable>
        </View>
        {storedObject && (
          <View className="p-3 bg-green-50 rounded-lg border border-green-200">
            <Text className="text-sm text-green-900">
              Stored: <Text className="font-semibold">{JSON.stringify(storedObject)}</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Clear Button */}
      <Pressable
        className="bg-red-500 px-4 py-3 rounded-lg shadow-sm active:bg-red-600"
        onPress={handleClear}
      >
        <Text className="text-white font-semibold text-center">Clear All Storage</Text>
      </Pressable>
    </View>
  );
}

