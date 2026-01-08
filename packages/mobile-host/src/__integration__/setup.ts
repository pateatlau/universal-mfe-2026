/**
 * Integration test setup for mobile-host
 *
 * Sets up the testing environment with comprehensive React Native mocks
 * for provider composition and navigation testing.
 *
 * Note: Full RN runtime tests should use Detox or Maestro. These integration
 * tests verify provider logic and state management without device/simulator.
 */

import '@testing-library/jest-dom';

// Mock react-native before any imports
jest.mock('react-native', () => {
  const React = require('react');

  // Mock StyleSheet
  const StyleSheet = {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
    flatten: (style: unknown) => style,
    absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    absoluteFillObject: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    hairlineWidth: 1,
  };

  // Mock View component
  const View = React.forwardRef(
    (
      {
        children,
        testID,
        style,
        ...props
      }: { children?: React.ReactNode; testID?: string; style?: unknown },
      ref: unknown
    ) => {
      return React.createElement(
        'View',
        { ...props, 'data-testid': testID, style, ref },
        children
      );
    }
  );
  View.displayName = 'View';

  // Mock Text component
  const Text = React.forwardRef(
    (
      {
        children,
        testID,
        style,
        ...props
      }: { children?: React.ReactNode; testID?: string; style?: unknown },
      ref: unknown
    ) => {
      return React.createElement(
        'Text',
        { ...props, 'data-testid': testID, style, ref },
        children
      );
    }
  );
  Text.displayName = 'Text';

  // Mock Pressable component
  const Pressable = React.forwardRef(
    (
      {
        children,
        testID,
        onPress,
        style,
        ...props
      }: {
        children?: React.ReactNode;
        testID?: string;
        onPress?: () => void;
        style?: unknown;
      },
      ref: unknown
    ) => {
      return React.createElement(
        'Pressable',
        { ...props, 'data-testid': testID, onClick: onPress, style, ref },
        children
      );
    }
  );
  Pressable.displayName = 'Pressable';

  // Mock TouchableOpacity
  const TouchableOpacity = Pressable;

  // Mock Platform
  const Platform = {
    OS: 'ios' as const,
    Version: '16.0',
    select: <T,>(obj: { ios?: T; android?: T; default?: T }): T | undefined =>
      obj.ios ?? obj.default,
    isTV: false,
    isTesting: true,
  };

  // Mock Dimensions
  const Dimensions = {
    get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
    set: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };

  // Mock Animated
  const Animated = {
    View,
    Text,
    Image: View,
    ScrollView: View,
    FlatList: View,
    createAnimatedComponent: (comp: unknown) => comp,
    Value: jest.fn().mockImplementation(() => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      interpolate: jest.fn().mockReturnThis(),
    })),
    ValueXY: jest.fn().mockImplementation(() => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      getLayout: jest.fn(),
      getTranslateTransform: jest.fn(),
    })),
    timing: jest.fn().mockReturnValue({ start: jest.fn() }),
    spring: jest.fn().mockReturnValue({ start: jest.fn() }),
    decay: jest.fn().mockReturnValue({ start: jest.fn() }),
    parallel: jest.fn().mockReturnValue({ start: jest.fn() }),
    sequence: jest.fn().mockReturnValue({ start: jest.fn() }),
    stagger: jest.fn().mockReturnValue({ start: jest.fn() }),
    loop: jest.fn().mockReturnValue({ start: jest.fn() }),
    event: jest.fn(),
    add: jest.fn(),
    subtract: jest.fn(),
    divide: jest.fn(),
    multiply: jest.fn(),
    modulo: jest.fn(),
    diffClamp: jest.fn(),
    delay: jest.fn(),
  };

  // Mock ScrollView
  const ScrollView = React.forwardRef(
    (
      {
        children,
        testID,
        style,
        ...props
      }: { children?: React.ReactNode; testID?: string; style?: unknown },
      ref: unknown
    ) => {
      return React.createElement(
        'ScrollView',
        { ...props, 'data-testid': testID, style, ref },
        children
      );
    }
  );
  ScrollView.displayName = 'ScrollView';

  // Mock ActivityIndicator
  const ActivityIndicator = React.forwardRef(
    (
      { testID, ...props }: { testID?: string; [key: string]: unknown },
      ref: unknown
    ) => {
      return React.createElement('ActivityIndicator', {
        ...props,
        'data-testid': testID,
        ref,
      });
    }
  );
  ActivityIndicator.displayName = 'ActivityIndicator';

  return {
    View,
    Text,
    Pressable,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    Platform,
    Dimensions,
    Animated,
    // Other commonly used exports
    Image: View,
    TextInput: View,
    FlatList: View,
    SectionList: View,
    SafeAreaView: View,
    KeyboardAvoidingView: View,
    Modal: View,
    Switch: View,
    StatusBar: { setBarStyle: jest.fn() },
    Appearance: { getColorScheme: () => 'light', addChangeListener: jest.fn() },
    useColorScheme: () => 'light',
    useWindowDimensions: () => ({ width: 375, height: 812 }),
    PixelRatio: { get: () => 2, getFontScale: () => 1, roundToNearestPixel: (n: number) => n },
    Linking: { openURL: jest.fn(), canOpenURL: jest.fn() },
    Alert: { alert: jest.fn() },
    Share: { share: jest.fn() },
    Vibration: { vibrate: jest.fn() },
    NativeModules: {},
    TurboModuleRegistry: { get: jest.fn(), getEnforcing: jest.fn() },
    findNodeHandle: jest.fn(),
    requireNativeComponent: jest.fn(),
    UIManager: { measure: jest.fn(), measureInWindow: jest.fn() },
  };
});

// Mock @callstack/repack/client
jest.mock('@callstack/repack/client', () => ({
  ScriptManager: {
    shared: {
      addResolver: jest.fn(),
      loadScript: jest.fn(),
      prefetchScript: jest.fn(),
      invalidateScripts: jest.fn(),
    },
  },
  Federated: {
    importModule: jest.fn(),
  },
}));

// Mock console.warn to suppress React Router deprecation warnings in tests
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes('React Router Future Flag Warning')
  ) {
    return;
  }
  originalWarn(...args);
};

// Suppress expected console errors during tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('Warning: An update to') ||
      message.includes('act(...)') ||
      // Suppress warnings about React Native component names in DOM environment
      message.includes('is using incorrect casing') ||
      message.includes('is unrecognized in this browser'))
  ) {
    return;
  }
  originalError(...args);
};

// Global test timeout for integration tests (longer than unit tests)
jest.setTimeout(15000);
