/**
 * Custom Jest matchers for accessibility testing.
 *
 * These matchers help verify that components have proper accessibility
 * attributes set. They work with React Native Testing Library's rendered
 * output.
 *
 * @example
 * ```tsx
 * import { render } from '@testing-library/react-native';
 * import { extendExpectWithA11yMatchers } from '@universal/shared-a11y/testing';
 *
 * // Extend Jest expect
 * extendExpectWithA11yMatchers();
 *
 * test('button is accessible', () => {
 *   const { getByRole } = render(<MyButton label="Submit" />);
 *   const button = getByRole('button');
 *
 *   expect(button).toHaveAccessibilityRole('button');
 *   expect(button).toHaveAccessibilityLabel('Submit');
 *   expect(button).toBeAccessible();
 * });
 * ```
 */

import { A11Y_MIN_TOUCH_TARGET } from '../constants';

/**
 * Accessibility state type
 */
interface A11yState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
}

/**
 * Accessibility value type
 */
interface A11yValue {
  min?: number;
  max?: number;
  now?: number;
  text?: string;
}

/**
 * Style type that can be a single object or array
 */
type StyleType = {
  minHeight?: number;
  minWidth?: number;
  height?: number;
  width?: number;
} | Array<Record<string, unknown>>;

/**
 * Props type for accessible elements
 */
interface AccessibleProps {
  accessible?: boolean;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: A11yState;
  accessibilityValue?: A11yValue;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  style?: StyleType;
}

/**
 * Type for React Native element props that we check for accessibility
 */
interface AccessibleElement {
  props?: AccessibleProps;
}

/**
 * Extract style value from potentially nested/array styles
 */
function getStyleValue(
  style: StyleType | undefined,
  property: string
): number | undefined {
  if (!style) return undefined;

  if (Array.isArray(style)) {
    // Search through array of styles, last defined value wins
    for (let i = style.length - 1; i >= 0; i--) {
      const value = style[i]?.[property];
      if (value !== undefined) return value as number;
    }
    return undefined;
  }

  return (style as Record<string, unknown>)[property] as number | undefined;
}

/**
 * Custom matcher: toHaveAccessibilityRole
 *
 * Checks if an element has the expected accessibility role.
 */
function toHaveAccessibilityRole(
  received: AccessibleElement,
  expectedRole: string
): jest.CustomMatcherResult {
  const actualRole = received?.props?.accessibilityRole;
  const pass = actualRole === expectedRole;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have accessibilityRole "${expectedRole}", but it does`
        : `Expected element to have accessibilityRole "${expectedRole}", but got "${actualRole ?? 'undefined'}"`,
  };
}

/**
 * Custom matcher: toHaveAccessibilityLabel
 *
 * Checks if an element has the expected accessibility label.
 * Supports partial matching with { exact: false } option.
 */
function toHaveAccessibilityLabel(
  received: AccessibleElement,
  expectedLabel: string,
  options?: { exact?: boolean }
): jest.CustomMatcherResult {
  const actualLabel = received?.props?.accessibilityLabel;
  const exact = options?.exact ?? true;

  const pass = exact
    ? actualLabel === expectedLabel
    : actualLabel?.includes(expectedLabel) ?? false;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have accessibilityLabel ${exact ? '' : 'containing '}"${expectedLabel}", but it does`
        : `Expected element to have accessibilityLabel ${exact ? '' : 'containing '}"${expectedLabel}", but got "${actualLabel ?? 'undefined'}"`,
  };
}

/**
 * Custom matcher: toHaveAccessibilityHint
 *
 * Checks if an element has the expected accessibility hint.
 */
function toHaveAccessibilityHint(
  received: AccessibleElement,
  expectedHint: string
): jest.CustomMatcherResult {
  const actualHint = received?.props?.accessibilityHint;
  const pass = actualHint === expectedHint;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have accessibilityHint "${expectedHint}", but it does`
        : `Expected element to have accessibilityHint "${expectedHint}", but got "${actualHint ?? 'undefined'}"`,
  };
}

/**
 * Custom matcher: toHaveAccessibilityState
 *
 * Checks if an element has the expected accessibility state values.
 */
function toHaveAccessibilityState(
  received: AccessibleElement,
  expectedState: Partial<A11yState>
): jest.CustomMatcherResult {
  const actualState = received?.props?.accessibilityState ?? {};

  const mismatches: string[] = [];

  for (const [key, expectedValue] of Object.entries(expectedState)) {
    const actualValue = actualState[key as keyof typeof actualState];
    if (actualValue !== expectedValue) {
      mismatches.push(
        `${key}: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`
      );
    }
  }

  const pass = mismatches.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have accessibilityState ${JSON.stringify(expectedState)}, but it does`
        : `Expected element to have accessibilityState ${JSON.stringify(expectedState)}, but found mismatches:\n${mismatches.join('\n')}`,
  };
}

/**
 * Custom matcher: toBeAccessible
 *
 * Checks if an element has basic accessibility requirements:
 * - Has accessible={true} or an accessibilityRole
 * - Has an accessibilityLabel (for interactive elements)
 */
function toBeAccessible(received: AccessibleElement): jest.CustomMatcherResult {
  const props = received?.props;
  const issues: string[] = [];

  // Check if element is marked as accessible or has a role
  const hasAccessibility =
    props?.accessible === true || props?.accessibilityRole !== undefined;

  if (!hasAccessibility) {
    issues.push('Element is not marked as accessible (missing accessible={true} or accessibilityRole)');
  }

  // Interactive roles that require labels
  const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'switch', 'slider', 'combobox'];
  const isInteractive = interactiveRoles.includes(props?.accessibilityRole ?? '');

  if (isInteractive && !props?.accessibilityLabel) {
    issues.push(`Interactive element with role "${props?.accessibilityRole}" is missing accessibilityLabel`);
  }

  const pass = issues.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? 'Expected element not to be accessible, but it is'
        : `Expected element to be accessible, but found issues:\n- ${issues.join('\n- ')}`,
  };
}

/**
 * Custom matcher: toHaveMinimumTouchTarget
 *
 * Checks if an element meets the WCAG 2.1 AA minimum touch target size (44x44).
 */
function toHaveMinimumTouchTarget(
  received: AccessibleElement,
  minSize: number = A11Y_MIN_TOUCH_TARGET
): jest.CustomMatcherResult {
  const style = received?.props?.style;
  const issues: string[] = [];

  const minHeight = getStyleValue(style, 'minHeight') ?? getStyleValue(style, 'height');
  const minWidth = getStyleValue(style, 'minWidth') ?? getStyleValue(style, 'width');

  if (minHeight === undefined) {
    issues.push(`Missing minHeight or height style (expected >= ${minSize})`);
  } else if (minHeight < minSize) {
    issues.push(`minHeight ${minHeight} is less than ${minSize}`);
  }

  if (minWidth === undefined) {
    issues.push(`Missing minWidth or width style (expected >= ${minSize})`);
  } else if (minWidth < minSize) {
    issues.push(`minWidth ${minWidth} is less than ${minSize}`);
  }

  const pass = issues.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have minimum touch target of ${minSize}x${minSize}, but it does`
        : `Expected element to have minimum touch target of ${minSize}x${minSize}, but found issues:\n- ${issues.join('\n- ')}`,
  };
}

/**
 * Custom matcher: toHaveAccessibilityValue
 *
 * Checks if an element has the expected accessibility value (for sliders, progress bars, etc.).
 */
function toHaveAccessibilityValue(
  received: AccessibleElement,
  expectedValue: Partial<A11yValue>
): jest.CustomMatcherResult {
  const actualValue = received?.props?.accessibilityValue ?? {};

  const mismatches: string[] = [];

  for (const [key, expectedVal] of Object.entries(expectedValue)) {
    const actualVal = actualValue[key as keyof typeof actualValue];
    if (actualVal !== expectedVal) {
      mismatches.push(
        `${key}: expected ${JSON.stringify(expectedVal)}, got ${JSON.stringify(actualVal)}`
      );
    }
  }

  const pass = mismatches.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have accessibilityValue ${JSON.stringify(expectedValue)}, but it does`
        : `Expected element to have accessibilityValue ${JSON.stringify(expectedValue)}, but found mismatches:\n${mismatches.join('\n')}`,
  };
}

/**
 * All custom accessibility matchers
 */
export const a11yMatchers = {
  toHaveAccessibilityRole,
  toHaveAccessibilityLabel,
  toHaveAccessibilityHint,
  toHaveAccessibilityState,
  toHaveAccessibilityValue,
  toBeAccessible,
  toHaveMinimumTouchTarget,
};

/**
 * Extend Jest's expect with accessibility matchers.
 *
 * Call this in your test setup file:
 * ```ts
 * import { extendExpectWithA11yMatchers } from '@universal/shared-a11y/testing';
 * extendExpectWithA11yMatchers();
 * ```
 */
export function extendExpectWithA11yMatchers(): void {
  if (typeof expect !== 'undefined' && typeof expect.extend === 'function') {
    expect.extend(a11yMatchers);
  }
}

/**
 * TypeScript declaration merging for custom matchers.
 * This provides autocomplete and type checking for the matchers.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveAccessibilityRole(role: string): R;
      toHaveAccessibilityLabel(label: string, options?: { exact?: boolean }): R;
      toHaveAccessibilityHint(hint: string): R;
      toHaveAccessibilityState(
        state: Partial<{
          disabled?: boolean;
          selected?: boolean;
          checked?: boolean | 'mixed';
          busy?: boolean;
          expanded?: boolean;
        }>
      ): R;
      toHaveAccessibilityValue(
        value: Partial<{
          min?: number;
          max?: number;
          now?: number;
          text?: string;
        }>
      ): R;
      toBeAccessible(): R;
      toHaveMinimumTouchTarget(minSize?: number): R;
    }
  }
}
