/**
 * Accessibility testing utilities for Jest.
 *
 * @example
 * ```ts
 * // In your jest.setup.js or test file:
 * import { extendExpectWithA11yMatchers } from '@universal/shared-a11y/testing';
 *
 * // Extend Jest's expect with a11y matchers
 * extendExpectWithA11yMatchers();
 *
 * // Then in your tests:
 * expect(element).toHaveAccessibilityRole('button');
 * expect(element).toHaveAccessibilityLabel('Submit');
 * expect(element).toBeAccessible();
 * expect(element).toHaveMinimumTouchTarget();
 * ```
 */

export { a11yMatchers, extendExpectWithA11yMatchers } from './a11yMatchers';
