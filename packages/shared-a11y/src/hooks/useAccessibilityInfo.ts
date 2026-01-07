import { useState, useEffect, useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Accessibility state information available across platforms
 */
export interface AccessibilityState {
  /** Whether a screen reader (VoiceOver/TalkBack) is enabled */
  isScreenReaderEnabled: boolean;
  /** Whether reduce motion is enabled (prefers-reduced-motion) */
  isReduceMotionEnabled: boolean;
  /** Whether bold text is enabled (iOS only, false on other platforms) */
  isBoldTextEnabled: boolean;
  /** Whether grayscale mode is enabled (Android only, false on other platforms) */
  isGrayscaleEnabled: boolean;
  /** Whether invert colors is enabled (iOS only, false on other platforms) */
  isInvertColorsEnabled: boolean;
  /** Whether reduce transparency is enabled (iOS only, false on other platforms) */
  isReduceTransparencyEnabled: boolean;
}

const defaultState: AccessibilityState = {
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isBoldTextEnabled: false,
  isGrayscaleEnabled: false,
  isInvertColorsEnabled: false,
  isReduceTransparencyEnabled: false,
};

/**
 * Hook to access platform-aware accessibility information.
 * Automatically subscribes to accessibility state changes.
 *
 * @returns Current accessibility state with reactive updates
 *
 * @example
 * ```tsx
 * const { isScreenReaderEnabled, isReduceMotionEnabled } = useAccessibilityInfo();
 *
 * // Skip animations when reduce motion is enabled
 * const animationDuration = isReduceMotionEnabled ? 0 : 300;
 *
 * // Provide additional context for screen readers
 * if (isScreenReaderEnabled) {
 *   // Add more descriptive labels
 * }
 * ```
 */
export function useAccessibilityInfo(): AccessibilityState {
  const [state, setState] = useState<AccessibilityState>(defaultState);

  const updateScreenReaderEnabled = useCallback((isEnabled: boolean) => {
    setState((prev) => ({ ...prev, isScreenReaderEnabled: isEnabled }));
  }, []);

  const updateReduceMotionEnabled = useCallback((isEnabled: boolean) => {
    setState((prev) => ({ ...prev, isReduceMotionEnabled: isEnabled }));
  }, []);

  const updateBoldTextEnabled = useCallback((isEnabled: boolean) => {
    setState((prev) => ({ ...prev, isBoldTextEnabled: isEnabled }));
  }, []);

  const updateGrayscaleEnabled = useCallback((isEnabled: boolean) => {
    setState((prev) => ({ ...prev, isGrayscaleEnabled: isEnabled }));
  }, []);

  const updateInvertColorsEnabled = useCallback((isEnabled: boolean) => {
    setState((prev) => ({ ...prev, isInvertColorsEnabled: isEnabled }));
  }, []);

  const updateReduceTransparencyEnabled = useCallback((isEnabled: boolean) => {
    setState((prev) => ({ ...prev, isReduceTransparencyEnabled: isEnabled }));
  }, []);

  useEffect(() => {
    // Fetch initial state
    const fetchInitialState = async () => {
      const [
        screenReaderEnabled,
        reduceMotionEnabled,
        boldTextEnabled,
        grayscaleEnabled,
        invertColorsEnabled,
        reduceTransparencyEnabled,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        Platform.OS === 'ios'
          ? AccessibilityInfo.isBoldTextEnabled()
          : Promise.resolve(false),
        Platform.OS === 'android'
          ? AccessibilityInfo.isGrayscaleEnabled()
          : Promise.resolve(false),
        Platform.OS === 'ios'
          ? AccessibilityInfo.isInvertColorsEnabled()
          : Promise.resolve(false),
        Platform.OS === 'ios'
          ? AccessibilityInfo.isReduceTransparencyEnabled()
          : Promise.resolve(false),
      ]);

      setState({
        isScreenReaderEnabled: screenReaderEnabled,
        isReduceMotionEnabled: reduceMotionEnabled,
        isBoldTextEnabled: boldTextEnabled,
        isGrayscaleEnabled: grayscaleEnabled,
        isInvertColorsEnabled: invertColorsEnabled,
        isReduceTransparencyEnabled: reduceTransparencyEnabled,
      });
    };

    fetchInitialState();

    // Subscribe to changes
    const subscriptions = [
      AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        updateScreenReaderEnabled
      ),
      AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        updateReduceMotionEnabled
      ),
    ];

    // Platform-specific subscriptions
    if (Platform.OS === 'ios') {
      subscriptions.push(
        AccessibilityInfo.addEventListener(
          'boldTextChanged',
          updateBoldTextEnabled
        ),
        AccessibilityInfo.addEventListener(
          'invertColorsChanged',
          updateInvertColorsEnabled
        ),
        AccessibilityInfo.addEventListener(
          'reduceTransparencyChanged',
          updateReduceTransparencyEnabled
        )
      );
    }

    if (Platform.OS === 'android') {
      subscriptions.push(
        AccessibilityInfo.addEventListener(
          'grayscaleChanged',
          updateGrayscaleEnabled
        )
      );
    }

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [
    updateScreenReaderEnabled,
    updateReduceMotionEnabled,
    updateBoldTextEnabled,
    updateGrayscaleEnabled,
    updateInvertColorsEnabled,
    updateReduceTransparencyEnabled,
  ]);

  return state;
}

/**
 * Hook to check if a screen reader is currently active.
 * Simplified version of useAccessibilityInfo for common use case.
 *
 * @returns Boolean indicating if screen reader is enabled
 */
export function useScreenReader(): boolean {
  const { isScreenReaderEnabled } = useAccessibilityInfo();
  return isScreenReaderEnabled;
}

/**
 * Hook to check if reduced motion is preferred.
 * Use this to conditionally disable or reduce animations.
 *
 * @returns Boolean indicating if reduce motion is enabled
 */
export function useReduceMotion(): boolean {
  const { isReduceMotionEnabled } = useAccessibilityInfo();
  return isReduceMotionEnabled;
}
