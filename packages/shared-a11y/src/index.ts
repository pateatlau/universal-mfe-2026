/**
 * @universal/shared-a11y
 *
 * Universal accessibility utilities for React Native applications.
 * Works across Web, iOS, and Android platforms.
 *
 * @example
 * ```tsx
 * import {
 *   useAccessibilityInfo,
 *   useAnnounce,
 *   useFocusManagement,
 *   A11yRoles,
 *   A11yLabels,
 * } from '@universal/shared-a11y';
 *
 * function MyComponent() {
 *   const { isScreenReaderEnabled, isReduceMotionEnabled } = useAccessibilityInfo();
 *   const { announce } = useAnnounce();
 *   const { setFocus } = useFocusManagement();
 *
 *   return (
 *     <Pressable
 *       accessibilityRole={A11yRoles.BUTTON}
 *       accessibilityLabel={A11yLabels.SUBMIT}
 *       onPress={() => {
 *         announce('Form submitted');
 *       }}
 *     >
 *       <Text>Submit</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */

// Hooks
export {
  // Accessibility Info
  useAccessibilityInfo,
  useScreenReader,
  useReduceMotion,
  type AccessibilityState,
  // Focus Management
  useFocusManagement,
  useFocusOnMount,
  useFocusTrap,
  type FocusManagement,
  // Announcements
  useAnnounce,
  useAnnounceResult,
  type AnnouncementPriority,
  type AnnounceAPI,
} from './hooks';

// Constants
export {
  A11yRoles,
  A11yStates,
  A11yActions,
  A11yLabels,
  A11yHints,
  A11yLiveRegion,
  A11Y_MIN_TOUCH_TARGET,
  A11Y_CONTRAST_RATIOS,
} from './constants';

// Components
export {
  // Accessible Text
  AccessibleText,
  type AccessibleTextProps,
  // Accessible Button
  AccessibleButton,
  type AccessibleButtonProps,
  // Accessible Input
  AccessibleInput,
  type AccessibleInputProps,
  // Skip Link
  SkipLink,
  type SkipLinkProps,
  // Visually Hidden
  VisuallyHidden,
  visuallyHiddenStyle,
  type VisuallyHiddenProps,
} from './components';
