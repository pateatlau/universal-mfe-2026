/**
 * Variable interpolation utilities for translation strings.
 *
 * Supports the {{variableName}} syntax for inserting dynamic values
 * into translation strings.
 */

/**
 * Regular expression to match interpolation placeholders.
 * Matches {{variableName}} patterns.
 *
 * Note: We have two versions - global for replace/matchAll operations,
 * and non-global for test() to avoid stateful lastIndex behavior.
 */
const INTERPOLATION_REGEX = /\{\{(\w+)\}\}/g;

/** Non-global version for hasInterpolation() to avoid stateful lastIndex */
const INTERPOLATION_REGEX_TEST = /\{\{(\w+)\}\}/;

/**
 * Interpolate variables into a translation string.
 *
 * Replaces {{variableName}} placeholders with values from the params object.
 * Missing params are left as-is ({{missing}}) to aid debugging.
 *
 * @param template - The template string with {{variable}} placeholders
 * @param params - Object containing variable values
 * @returns The interpolated string
 *
 * @example
 * ```ts
 * interpolate('Hello, {{name}}!', { name: 'World' })
 * // 'Hello, World!'
 *
 * interpolate('{{count}} items in {{location}}', { count: 5, location: 'cart' })
 * // '5 items in cart'
 *
 * interpolate('Hello, {{name}}!', {})
 * // 'Hello, {{name}}!' (missing param preserved)
 * ```
 */
export function interpolate(
  template: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params || Object.keys(params).length === 0) {
    return template;
  }

  return template.replace(INTERPOLATION_REGEX, (match, key) => {
    const value = params[key];

    if (value === undefined || value === null) {
      // Keep the placeholder for debugging
      return match;
    }

    return String(value);
  });
}

/**
 * Extract all variable names from a template string.
 *
 * Useful for validation and documentation.
 *
 * @param template - The template string to analyze
 * @returns Array of variable names found in the template
 *
 * @example
 * ```ts
 * extractVariables('Hello, {{name}}! You have {{count}} messages.')
 * // ['name', 'count']
 *
 * extractVariables('No variables here')
 * // []
 * ```
 */
export function extractVariables(template: string): string[] {
  const matches = template.matchAll(INTERPOLATION_REGEX);
  const variables: string[] = [];

  for (const match of matches) {
    if (match[1] && !variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Check if a template string has any interpolation placeholders.
 *
 * @param template - The template string to check
 * @returns True if the template contains {{variable}} placeholders
 *
 * @example
 * ```ts
 * hasInterpolation('Hello, {{name}}!')
 * // true
 *
 * hasInterpolation('Hello, World!')
 * // false
 * ```
 */
export function hasInterpolation(template: string): boolean {
  return INTERPOLATION_REGEX_TEST.test(template);
}

/**
 * Validate that all required variables are provided.
 *
 * @param template - The template string
 * @param params - The provided parameters
 * @returns Object with validation result and missing variables
 *
 * @example
 * ```ts
 * validateInterpolation('{{name}} has {{count}} items', { name: 'John' })
 * // { valid: false, missing: ['count'] }
 *
 * validateInterpolation('{{name}} has {{count}} items', { name: 'John', count: 5 })
 * // { valid: true, missing: [] }
 * ```
 */
export function validateInterpolation(
  template: string,
  params: Record<string, unknown>
): { valid: boolean; missing: string[] } {
  const required = extractVariables(template);
  const missing = required.filter(
    (key) => params[key] === undefined || params[key] === null
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Create a type-safe interpolation function for a specific template.
 *
 * This is useful for creating reusable translation functions with
 * TypeScript type checking for required parameters.
 *
 * @param template - The template string
 * @returns A function that accepts params and returns the interpolated string
 *
 * @example
 * ```ts
 * const greet = createInterpolator<{ name: string }>('Hello, {{name}}!');
 * greet({ name: 'World' }) // 'Hello, World!'
 *
 * const count = createInterpolator<{ count: number; item: string }>(
 *   'You have {{count}} {{item}}'
 * );
 * count({ count: 5, item: 'apples' }) // 'You have 5 apples'
 * ```
 */
export function createInterpolator<T extends Record<string, string | number | boolean>>(
  template: string
): (params: T) => string {
  return (params: T) => interpolate(template, params);
}
