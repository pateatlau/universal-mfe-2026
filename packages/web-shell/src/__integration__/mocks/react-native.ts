/**
 * React Native mock for Jest integration testing
 *
 * This provides minimal implementations of React Native components
 * that work in a JSDOM environment for integration tests.
 */

import React from 'react';

// Types for style objects
type ViewStyle = Record<string, unknown>;
type TextStyle = Record<string, unknown>;

// Helper to create testable React components from RN primitives
function createMockComponent(name: string) {
  const Component = React.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      const { children, testID, accessibilityRole, accessibilityLabel, accessibilityHint, accessible, ...rest } = props;
      return React.createElement(
        name === 'Text' ? 'span' : 'div',
        {
          ref,
          'data-testid': testID,
          role: accessibilityRole,
          'aria-label': accessibilityLabel,
          'aria-describedby': accessibilityHint ? `hint-${testID || 'unknown'}` : undefined,
          ...rest,
        },
        accessibilityHint
          ? React.createElement(
              React.Fragment,
              null,
              children,
              React.createElement('span', { id: `hint-${testID || 'unknown'}`, hidden: true }, accessibilityHint)
            )
          : children
      );
    }
  );
  Component.displayName = name;
  return Component;
}

// View component
export const View = createMockComponent('View');

// Text component
export const Text = createMockComponent('Text');

// Pressable component with press handling
export const Pressable = React.forwardRef(
  (
    props: Record<string, unknown> & { onPress?: () => void },
    ref: React.Ref<unknown>
  ) => {
    const {
      children,
      onPress,
      testID,
      accessibilityRole,
      accessibilityLabel,
      accessibilityHint,
      accessible,
      disabled,
      style,
      ...rest
    } = props;
    return React.createElement(
      'button',
      {
        ref,
        onClick: onPress,
        disabled: disabled as boolean,
        'data-testid': testID,
        role: accessibilityRole || 'button',
        'aria-label': accessibilityLabel,
        'aria-describedby': accessibilityHint ? `hint-${testID || 'pressable'}` : undefined,
        style: typeof style === 'function' ? style({ pressed: false }) : style,
        ...rest,
      },
      accessibilityHint
        ? React.createElement(
            React.Fragment,
            null,
            children,
            React.createElement('span', { id: `hint-${testID || 'pressable'}`, hidden: true }, accessibilityHint)
          )
        : children
    );
  }
);
Pressable.displayName = 'Pressable';

// TouchableOpacity (alias for Pressable)
export const TouchableOpacity = Pressable;

// ScrollView
export const ScrollView = createMockComponent('ScrollView');

// Image
export const Image = React.forwardRef(
  (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    const { source, testID, accessibilityLabel, ...rest } = props;
    const src =
      typeof source === 'object' && source !== null && 'uri' in source
        ? (source as { uri: string }).uri
        : '';
    return React.createElement('img', {
      ref,
      src,
      'data-testid': testID,
      alt: accessibilityLabel || '',
      ...rest,
    });
  }
);
Image.displayName = 'Image';

// TextInput
export const TextInput = React.forwardRef(
  (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    const { testID, accessibilityLabel, onChangeText, placeholder, value, ...rest } = props;
    return React.createElement('input', {
      ref,
      'data-testid': testID,
      'aria-label': accessibilityLabel,
      placeholder: placeholder as string,
      value: value as string,
      onChange: onChangeText
        ? (e: { target: { value: string } }) =>
            (onChangeText as (text: string) => void)(e.target.value)
        : undefined,
      ...rest,
    });
  }
);
TextInput.displayName = 'TextInput';

// SafeAreaView
export const SafeAreaView = createMockComponent('SafeAreaView');

// ActivityIndicator
export const ActivityIndicator = React.forwardRef(
  (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    const { testID, accessibilityLabel, size, color, ...rest } = props;
    return React.createElement('div', {
      ref,
      'data-testid': testID,
      'aria-label': accessibilityLabel || 'Loading',
      role: 'progressbar',
      ...rest,
    }, 'Loading...');
  }
);
ActivityIndicator.displayName = 'ActivityIndicator';

// FlatList (simplified)
export const FlatList = React.forwardRef(
  (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    const {
      data,
      renderItem,
      keyExtractor,
      testID,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
    } = props;
    const items = Array.isArray(data) ? data : [];
    const getKey = keyExtractor as ((item: unknown, index: number) => string) | undefined;
    const render = renderItem as
      | ((info: { item: unknown; index: number }) => React.ReactNode)
      | undefined;

    return React.createElement(
      'div',
      { ref, 'data-testid': testID },
      ListHeaderComponent,
      items.length === 0 && ListEmptyComponent
        ? ListEmptyComponent
        : items.map((item, index) =>
            React.createElement(
              'div',
              { key: getKey ? getKey(item, index) : index },
              render ? render({ item, index }) : null
            )
          ),
      ListFooterComponent
    );
  }
);
FlatList.displayName = 'FlatList';

// StyleSheet
export const StyleSheet = {
  create: <T extends Record<string, ViewStyle | TextStyle>>(styles: T): T => styles,
  flatten: (style: unknown): Record<string, unknown> => {
    if (Array.isArray(style)) {
      return style.reduce(
        (acc, s) => ({ ...acc, ...StyleSheet.flatten(s) }),
        {}
      );
    }
    return (style as Record<string, unknown>) || {};
  },
  hairlineWidth: 1,
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

// Platform
export const Platform = {
  OS: 'web' as const,
  select: <T>(options: { ios?: T; android?: T; web?: T; default?: T }): T | undefined =>
    options.web ?? options.default,
  Version: 0,
  isTV: false,
  isTesting: true,
};

// Dimensions
export const Dimensions = {
  get: (dim: 'window' | 'screen') => ({
    width: dim === 'window' ? 375 : 375,
    height: dim === 'window' ? 812 : 812,
    scale: 2,
    fontScale: 1,
  }),
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

// AccessibilityInfo
export const AccessibilityInfo = {
  isScreenReaderEnabled: () => Promise.resolve(false),
  isReduceMotionEnabled: () => Promise.resolve(false),
  isBoldTextEnabled: () => Promise.resolve(false),
  isGrayscaleEnabled: () => Promise.resolve(false),
  isInvertColorsEnabled: () => Promise.resolve(false),
  isReduceTransparencyEnabled: () => Promise.resolve(false),
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
  announceForAccessibility: () => {},
  setAccessibilityFocus: () => {},
};

// Animated (basic mock)
class AnimatedValue {
  private _value: number;
  constructor(value: number) {
    this._value = value;
  }
  setValue(value: number) {
    this._value = value;
  }
  interpolate(_config: { inputRange: number[]; outputRange: number[] }) {
    return this;
  }
}

export const Animated = {
  Value: AnimatedValue,
  View: createMockComponent('Animated.View'),
  Text: createMockComponent('Animated.Text'),
  Image: Image,
  ScrollView: ScrollView,
  timing: (value: AnimatedValue, config: { toValue: number }) => ({
    start: (callback?: (result: { finished: boolean }) => void) => {
      value.setValue(config.toValue);
      callback?.({ finished: true });
    },
    stop: () => {},
  }),
  spring: (value: AnimatedValue, config: { toValue: number }) => ({
    start: (callback?: (result: { finished: boolean }) => void) => {
      value.setValue(config.toValue);
      callback?.({ finished: true });
    },
    stop: () => {},
  }),
  parallel: (animations: { start: (cb?: () => void) => void }[]) => ({
    start: (callback?: () => void) => {
      animations.forEach((anim) => anim.start?.());
      callback?.();
    },
    stop: () => {},
  }),
  sequence: (animations: { start: (cb?: () => void) => void }[]) => ({
    start: (callback?: () => void) => {
      animations.forEach((anim) => anim.start?.());
      callback?.();
    },
    stop: () => {},
  }),
  loop: () => ({
    start: () => {},
    stop: () => {},
  }),
  createAnimatedComponent: (Component: React.ComponentType) => Component,
};

// PixelRatio
export const PixelRatio = {
  get: () => 2,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (layoutSize: number) => layoutSize * 2,
  roundToNearestPixel: (layoutSize: number) => Math.round(layoutSize * 2) / 2,
};

// Appearance
export const Appearance = {
  getColorScheme: () => 'light' as const,
  addChangeListener: () => ({ remove: () => {} }),
};

// useColorScheme hook
export const useColorScheme = () => 'light' as const;

// NativeModules
export const NativeModules = {};

// Default export
export default {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Platform,
  Dimensions,
  AccessibilityInfo,
  Animated,
  PixelRatio,
  Appearance,
  useColorScheme,
  NativeModules,
};
