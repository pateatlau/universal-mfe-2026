import { useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Priority level for screen reader announcements
 */
export type AnnouncementPriority = 'polite' | 'assertive';

/**
 * Screen reader announcement utilities
 */
export interface AnnounceAPI {
  /**
   * Announce a message to screen reader users.
   *
   * @param message - The message to announce
   * @param priority - 'polite' (default) waits for current speech, 'assertive' interrupts
   */
  announce: (message: string, priority?: AnnouncementPriority) => void;

  /**
   * Announce a message politely (waits for current speech to finish)
   */
  announcePolite: (message: string) => void;

  /**
   * Announce a message assertively (interrupts current speech)
   * Use sparingly - only for critical/time-sensitive updates
   */
  announceAssertive: (message: string) => void;
}

/**
 * Hook for making screen reader announcements.
 * Uses AccessibilityInfo.announceForAccessibility on native
 * and ARIA live regions on web.
 *
 * @returns Announcement utilities
 *
 * @example
 * ```tsx
 * function Form() {
 *   const { announce, announceAssertive } = useAnnounce();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await submitForm();
 *       announce('Form submitted successfully');
 *     } catch (error) {
 *       announceAssertive('Error: Form submission failed');
 *     }
 *   };
 *
 *   return <Button onPress={handleSubmit}>Submit</Button>;
 * }
 * ```
 */
export function useAnnounce(): AnnounceAPI {
  const announce = useCallback(
    (message: string, priority: AnnouncementPriority = 'polite') => {
      if (!message) return;

      if (Platform.OS === 'web') {
        // On web, use ARIA live region
        announceForWeb(message, priority);
      } else {
        // On native, use AccessibilityInfo
        // Note: React Native's announceForAccessibility doesn't support priority
        // It's always somewhat assertive on iOS and polite on Android
        AccessibilityInfo.announceForAccessibility(message);
      }
    },
    []
  );

  const announcePolite = useCallback(
    (message: string) => {
      announce(message, 'polite');
    },
    [announce]
  );

  const announceAssertive = useCallback(
    (message: string) => {
      announce(message, 'assertive');
    },
    [announce]
  );

  return {
    announce,
    announcePolite,
    announceAssertive,
  };
}

/**
 * Web-specific implementation using ARIA live regions.
 * Creates a visually hidden element with the appropriate aria-live attribute.
 */
function announceForWeb(message: string, priority: AnnouncementPriority): void {
  // Get or create the announcer container
  let container = document.getElementById('a11y-announcer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'a11y-announcer';
    container.setAttribute('aria-live', priority);
    container.setAttribute('aria-atomic', 'true');
    container.setAttribute('role', 'status');

    // Visually hidden but accessible to screen readers
    Object.assign(container.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });

    document.body.appendChild(container);
  }

  // Update aria-live if priority changed
  container.setAttribute('aria-live', priority);

  // Clear and set message (the change triggers announcement)
  container.textContent = '';

  // Use requestAnimationFrame to ensure the clear is processed
  requestAnimationFrame(() => {
    if (container) {
      container.textContent = message;
    }
  });
}

/**
 * Announce the result of an async operation.
 * Convenience wrapper that handles success/error announcements.
 *
 * @param operation - The async operation to perform
 * @param options - Success and error messages
 * @returns The result of the operation
 *
 * @example
 * ```tsx
 * const { announceResult } = useAnnounce();
 *
 * const handleDelete = () => {
 *   announceResult(deleteItem(itemId), {
 *     success: 'Item deleted',
 *     error: 'Failed to delete item',
 *   });
 * };
 * ```
 */
export function useAnnounceResult() {
  const { announce, announceAssertive } = useAnnounce();

  const announceResult = useCallback(
    async <T>(
      operation: Promise<T>,
      options: {
        success: string;
        error: string;
        loading?: string;
      }
    ): Promise<T> => {
      if (options.loading) {
        announce(options.loading);
      }

      try {
        const result = await operation;
        announce(options.success);
        return result;
      } catch (error) {
        announceAssertive(options.error);
        throw error;
      }
    },
    [announce, announceAssertive]
  );

  return { announceResult };
}
