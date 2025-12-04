/**
 * Mock for react-native for Jest testing
 */

import React from 'react';

export const View = ({ children, style, testID }: any) => (
  <div data-testid={testID} style={style}>{children}</div>
);
export const Text = ({ children, style, testID }: any) => (
  <span data-testid={testID} style={style}>{children}</span>
);
export const Pressable = ({ children, onPress, style, testID }: any) => (
  <button data-testid={testID} onClick={onPress} style={style}>{children}</button>
);
export const ActivityIndicator = ({ size, color }: any) => (
  <div data-testid="activity-indicator" style={{ color }}>Loading...</div>
);
export const Platform = {
  OS: 'ios',
  select: (obj: any) => obj.ios || obj.default,
};
export const StyleSheet = {
  create: (styles: any) => styles,
};

