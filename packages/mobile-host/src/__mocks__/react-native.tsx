/**
 * Mock for react-native for Jest testing
 */

import React from 'react';

export const View = ({ children, style, testID, className }: any) => (
  <div data-testid={testID} className={className} style={style}>{children}</div>
);
export const Text = ({ children, style, testID, className }: any) => (
  <span data-testid={testID} className={className} style={style}>{children}</span>
);
export const Pressable = ({ children, onPress, style, testID, className }: any) => (
  <button data-testid={testID} className={className} onClick={onPress} style={style}>{children}</button>
);
export const ActivityIndicator = ({ size, color }: any) => (
  <div data-testid="activity-indicator" style={{ color }}>Loading...</div>
);
export const ScrollView = ({ children, style, testID, className, contentContainerStyle }: any) => (
  <div data-testid={testID} className={className} style={{ ...style, ...contentContainerStyle }}>{children}</div>
);
export const Platform = {
  OS: 'ios',
  select: (obj: any) => obj.ios || obj.default,
};
export const StyleSheet = {
  create: (styles: any) => styles,
};

