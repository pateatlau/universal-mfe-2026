/**
 * Jest setup file for React Native component testing
 *
 * This file mocks React Native modules that don't exist in the Jest
 * node environment to enable component unit testing.
 */

// Mock React Native's built-in modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock modules that require native code
  RN.NativeModules = {
    ...RN.NativeModules,
    SettingsManager: {
      settings: {},
    },
    StatusBarManager: {
      HEIGHT: 44,
      getHeight: jest.fn(),
    },
    DeviceInfo: {
      getConstants: () => ({}),
    },
    PlatformConstants: {
      getConstants: () => ({
        isTesting: true,
      }),
    },
    I18nManager: {
      localeIdentifier: 'en_US',
      allowRTL: jest.fn(),
      forceRTL: jest.fn(),
      swapLeftAndRightInRTL: jest.fn(),
      isRTL: false,
    },
    UIManager: {
      ...RN.UIManager,
      getViewManagerConfig: jest.fn(() => ({})),
      hasViewManagerConfig: jest.fn(() => false),
    },
  };

  // Mock AccessibilityInfo for a11y testing
  RN.AccessibilityInfo = {
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
    isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
    isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
    isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
    removeEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
    setAccessibilityFocus: jest.fn(),
  };

  // Mock Animated to work without native driver
  const AnimatedMock = {
    ...RN.Animated,
    timing: (value, config) => ({
      start: (callback) => {
        value.setValue(config.toValue);
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    spring: (value, config) => ({
      start: (callback) => {
        value.setValue(config.toValue);
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    decay: (value, config) => ({
      start: (callback) => {
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    parallel: (animations) => ({
      start: (callback) => {
        animations.forEach((anim) => anim.start?.());
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    sequence: (animations) => ({
      start: (callback) => {
        animations.forEach((anim) => anim.start?.());
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    loop: (animation) => ({
      start: jest.fn(),
      stop: jest.fn(),
    }),
  };

  return {
    ...RN,
    Animated: AnimatedMock,
  };
});

// Mock NativeEventEmitter for modules that use it
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const { EventEmitter } = require('events');
  return class MockNativeEventEmitter extends EventEmitter {
    addListener(eventType, listener) {
      super.addListener(eventType, listener);
      return {
        remove: () => this.removeListener(eventType, listener),
      };
    }
    removeListeners() {}
  };
});

// Mock DeviceEventEmitter
jest.mock(
  'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter',
  () => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    emit: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })
);

// Global mocks for testing-library
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Silence console warnings during tests (optional - comment out for debugging)
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out known React Native warnings that don't affect tests
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Animated: `useNativeDriver`') ||
      message.includes('componentWillReceiveProps') ||
      message.includes('componentWillMount'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Silence console errors for expected test scenarios (optional - comment out for debugging)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: An update to') ||
      message.includes('act(...)'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
