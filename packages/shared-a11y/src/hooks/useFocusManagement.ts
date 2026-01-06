import { useRef, useCallback, useEffect } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';
import type { View } from 'react-native';

type FocusableRef = React.RefObject<View | null>;

/**
 * Focus management utilities for accessible navigation
 */
export interface FocusManagement {
  /**
   * Set accessibility focus to a specific element.
   * On native, uses AccessibilityInfo.setAccessibilityFocus.
   * On web, uses native focus() method.
   */
  setFocus: (ref: FocusableRef) => void;

  /**
   * Store the currently focused element for later restoration.
   * Useful for modals, dialogs, and dropdown menus.
   */
  saveFocus: () => void;

  /**
   * Restore focus to the previously saved element.
   * Call this when closing modals or dialogs.
   */
  restoreFocus: () => void;
}

/**
 * Hook for managing accessibility focus.
 * Provides utilities for programmatic focus control and focus restoration.
 *
 * @returns Focus management utilities
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose, children }) {
 *   const { saveFocus, restoreFocus, setFocus } = useFocusManagement();
 *   const closeButtonRef = useRef<View>(null);
 *
 *   useEffect(() => {
 *     if (isOpen) {
 *       saveFocus();
 *       // Focus the close button when modal opens
 *       setFocus(closeButtonRef);
 *     } else {
 *       restoreFocus();
 *     }
 *   }, [isOpen]);
 *
 *   return (
 *     <View>
 *       <Pressable ref={closeButtonRef} onPress={onClose}>
 *         <Text>Close</Text>
 *       </Pressable>
 *       {children}
 *     </View>
 *   );
 * }
 * ```
 */
export function useFocusManagement(): FocusManagement {
  // Store reference to the previously focused element
  const savedFocusRef = useRef<FocusableRef | null>(null);
  const savedNodeHandleRef = useRef<number | null>(null);

  const setFocus = useCallback((ref: FocusableRef) => {
    if (!ref.current) return;

    if (Platform.OS === 'web') {
      // On web, use native focus
      const element = ref.current as unknown as HTMLElement;
      if (element && typeof element.focus === 'function') {
        element.focus();
      }
    } else {
      // On native, use AccessibilityInfo
      const nodeHandle = findNodeHandle(ref.current);
      if (nodeHandle) {
        AccessibilityInfo.setAccessibilityFocus(nodeHandle);
      }
    }
  }, []);

  const saveFocus = useCallback(() => {
    if (Platform.OS === 'web') {
      // On web, save the currently focused element
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement) {
        // Store a reference that can be used later
        savedNodeHandleRef.current = null;
        savedFocusRef.current = {
          current: activeElement as unknown as View,
        };
      }
    } else {
      // On native, we can't easily get the current focus
      // This is a limitation - consumers should pass the ref explicitly
      savedFocusRef.current = null;
      savedNodeHandleRef.current = null;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (savedFocusRef.current?.current) {
      setFocus(savedFocusRef.current);
      savedFocusRef.current = null;
      savedNodeHandleRef.current = null;
    }
  }, [setFocus]);

  return {
    setFocus,
    saveFocus,
    restoreFocus,
  };
}

/**
 * Hook to focus an element when it mounts or when a condition becomes true.
 * Useful for auto-focusing form fields or dialog elements.
 *
 * @param ref - Reference to the element to focus
 * @param shouldFocus - Whether to focus the element (default: true)
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const inputRef = useRef<View>(null);
 *   useFocusOnMount(inputRef);
 *
 *   return <TextInput ref={inputRef} accessibilityLabel="Search" />;
 * }
 * ```
 */
export function useFocusOnMount(
  ref: FocusableRef,
  shouldFocus: boolean = true
): void {
  const { setFocus } = useFocusManagement();

  useEffect(() => {
    if (shouldFocus) {
      // Small delay to ensure element is mounted and ready
      const timeoutId = setTimeout(() => {
        setFocus(ref);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocus, ref, setFocus]);
}

/**
 * Hook that creates a focus trap within a container.
 * Focus will cycle through focusable elements within the container.
 * Useful for modals, dialogs, and dropdown menus.
 *
 * @param containerRef - Reference to the container element
 * @param isActive - Whether the focus trap is active
 *
 * @example
 * ```tsx
 * function Dialog({ isOpen, children }) {
 *   const containerRef = useRef<View>(null);
 *   useFocusTrap(containerRef, isOpen);
 *
 *   return (
 *     <View ref={containerRef} accessibilityViewIsModal={true}>
 *       {children}
 *     </View>
 *   );
 * }
 * ```
 */
export function useFocusTrap(
  containerRef: FocusableRef,
  isActive: boolean
): void {
  useEffect(() => {
    if (!isActive || Platform.OS !== 'web') {
      // Focus trap is primarily a web concern
      // On native, use accessibilityViewIsModal instead
      return;
    }

    const container = containerRef.current as unknown as HTMLElement;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, isActive]);
}
