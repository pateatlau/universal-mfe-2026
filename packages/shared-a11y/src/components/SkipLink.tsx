import React, { useRef, useCallback } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useFocusManagement } from '../hooks/useFocusManagement';

/**
 * Props for SkipLink component
 */
export interface SkipLinkProps {
  /**
   * The text to display in the skip link
   * @default "Skip to main content"
   */
  label?: string;

  /**
   * Callback when the skip link is activated.
   * Use this to focus the main content area.
   */
  onSkip?: () => void;

  /**
   * Reference to the target element to focus.
   * Alternative to onSkip callback.
   */
  targetRef?: React.RefObject<View | null>;

  /**
   * Custom styles for the container
   */
  style?: ViewStyle;

  /**
   * Custom styles for the text
   */
  textStyle?: TextStyle;
}

/**
 * Skip link component for keyboard navigation.
 *
 * Skip links allow keyboard and screen reader users to bypass repetitive
 * navigation and jump directly to the main content. This is a WCAG 2.1 AA
 * requirement (Success Criterion 2.4.1).
 *
 * The link is visually hidden until focused, then appears at the top of
 * the viewport.
 *
 * **Note:** This component is primarily useful on web. On native mobile,
 * screen readers have their own navigation mechanisms, but the component
 * is still functional and can improve keyboard navigation on tablets.
 *
 * @example
 * ```tsx
 * function App() {
 *   const mainContentRef = useRef<View>(null);
 *
 *   return (
 *     <View>
 *       <SkipLink targetRef={mainContentRef} />
 *       <Header />
 *       <Navigation />
 *       <View ref={mainContentRef} accessible accessibilityRole="main">
 *         <MainContent />
 *       </View>
 *     </View>
 *   );
 * }
 *
 * // Or with callback
 * <SkipLink
 *   label="Skip to products"
 *   onSkip={() => {
 *     productsRef.current?.focus();
 *   }}
 * />
 * ```
 */
export function SkipLink({
  label = 'Skip to main content',
  onSkip,
  targetRef,
  style,
  textStyle,
}: SkipLinkProps): React.ReactElement {
  const linkRef = useRef<View>(null);
  const { setFocus } = useFocusManagement();
  const [isFocused, setIsFocused] = React.useState(false);

  const handlePress = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else if (targetRef) {
      setFocus(targetRef);
    }
  }, [onSkip, targetRef, setFocus]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // On web, we need to handle focus/blur events
  const webFocusProps =
    Platform.OS === 'web'
      ? {
          onFocus: handleFocus,
          onBlur: handleBlur,
        }
      : {};

  return (
    <Pressable
      ref={linkRef}
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint="Activates to skip navigation and go to main content"
      style={[
        styles.container,
        style,
        isFocused ? styles.visible : styles.hidden,
      ]}
      {...webFocusProps}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  hidden: {
    // Visually hidden but still focusable
    ...Platform.select({
      web: {
        // On web, position off-screen but focusable
        top: -100,
        opacity: 0,
      },
      default: {
        // On native, use display none (less common use case)
        display: 'none',
      },
    }),
  },
  visible: {
    top: 0,
    opacity: 1,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SkipLink;
