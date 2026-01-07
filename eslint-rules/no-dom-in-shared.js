/**
 * ESLint rule to prevent DOM usage in shared packages.
 *
 * Shared packages must be platform-agnostic and work on both web and mobile.
 * They should use React Native primitives (View, Text, Pressable) instead of
 * DOM elements, and use abstractions (like storage.ts) instead of direct
 * browser API access.
 *
 * Forbidden:
 * - DOM elements: div, span, button, input, form, a, img, etc.
 * - Browser globals: window, document, localStorage, sessionStorage
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow DOM elements and browser APIs in shared packages',
      category: 'Architecture',
      recommended: true,
    },
    messages: {
      noDomElement:
        'DOM element <{{element}}> is not allowed in shared packages. Use React Native primitives (View, Text, Pressable, etc.) instead.',
      noBrowserGlobal:
        'Browser global "{{global}}" is not allowed in shared packages. Use platform abstractions from @universal/shared-utils instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Only apply to shared-* packages (excluding test files)
    const isSharedPackage = /packages\/shared-[^/]+\/src\//.test(filename);
    const isTestFile = /\.(test|spec)\.[jt]sx?$/.test(filename);

    // Allow DOM APIs in shared-a11y package - it provides cross-platform
    // accessibility features that require platform-specific implementations
    // (e.g., ARIA live regions on web, AccessibilityInfo on native)
    const isA11yPackage = /packages\/shared-a11y\//.test(filename);

    // Allow DOM APIs in shared-i18n package - it needs platform-specific locale
    // detection (navigator.language on web, NativeModules on native) and
    // localStorage for persistence
    const isI18nPackage = /packages\/shared-i18n\//.test(filename);

    // Allow fetch in shared-data-layer package - fetch is universally available
    // on all target platforms (Web browsers, Node.js 18+, React Native 0.80+)
    const isDataLayerPackage = /packages\/shared-data-layer\//.test(filename);

    if (!isSharedPackage || isTestFile || isA11yPackage || isI18nPackage || isDataLayerPackage) {
      return {};
    }

    // DOM elements that are forbidden
    const forbiddenElements = new Set([
      // Block elements
      'div',
      'span',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'section',
      'article',
      'header',
      'footer',
      'nav',
      'main',
      'aside',
      // Form elements
      'form',
      'input',
      'textarea',
      'select',
      'option',
      'button',
      'label',
      // Media elements
      'img',
      'video',
      'audio',
      'canvas',
      'svg',
      // Table elements
      'table',
      'tr',
      'td',
      'th',
      'thead',
      'tbody',
      // List elements
      'ul',
      'ol',
      'li',
      // Link elements
      'a',
      // Other common elements
      'iframe',
      'br',
      'hr',
    ]);

    // Browser globals that are forbidden
    const forbiddenGlobals = new Set([
      'window',
      'document',
      'localStorage',
      'sessionStorage',
      'navigator',
      'location',
      'history',
      'alert',
      'confirm',
      'prompt',
      'fetch', // Should use a universal fetch abstraction
    ]);

    return {
      // Check JSX elements
      JSXOpeningElement(node) {
        const elementName = node.name;

        // Only check simple element names (not member expressions like View.Text)
        if (elementName.type === 'JSXIdentifier') {
          const name = elementName.name;

          // Check if it's a lowercase element (HTML) and forbidden
          if (
            name[0] === name[0].toLowerCase() &&
            forbiddenElements.has(name)
          ) {
            context.report({
              node,
              messageId: 'noDomElement',
              data: {
                element: name,
              },
            });
          }
        }
      },

      // Check for browser global usage
      Identifier(node) {
        const name = node.name;

        if (!forbiddenGlobals.has(name)) {
          return;
        }

        // Skip if it's a property access (obj.window is fine)
        const parent = node.parent;
        if (parent.type === 'MemberExpression' && parent.property === node) {
          return;
        }

        // Skip if it's a declaration (const window = ... is fine, though weird)
        if (
          parent.type === 'VariableDeclarator' &&
          parent.id === node
        ) {
          return;
        }

        // Skip if it's a function parameter
        if (
          parent.type === 'FunctionDeclaration' ||
          parent.type === 'FunctionExpression' ||
          parent.type === 'ArrowFunctionExpression'
        ) {
          const params = parent.params || [];
          if (params.includes(node)) {
            return;
          }
        }

        // Skip if it's a property key in object
        if (parent.type === 'Property' && parent.key === node && !parent.computed) {
          return;
        }

        // Skip import specifiers
        if (
          parent.type === 'ImportSpecifier' ||
          parent.type === 'ImportDefaultSpecifier' ||
          parent.type === 'ImportNamespaceSpecifier'
        ) {
          return;
        }

        // Special case: allow typeof checks (typeof window !== 'undefined')
        if (parent.type === 'UnaryExpression' && parent.operator === 'typeof') {
          return;
        }

        context.report({
          node,
          messageId: 'noBrowserGlobal',
          data: {
            global: name,
          },
        });
      },
    };
  },
};
