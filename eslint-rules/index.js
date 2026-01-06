/**
 * Custom ESLint rules for architecture enforcement.
 *
 * These rules help maintain the architectural boundaries of the
 * Universal Microfrontend Platform.
 */

module.exports = {
  rules: {
    'no-cross-mfe-imports': require('./no-cross-mfe-imports'),
    'no-dom-in-shared': require('./no-dom-in-shared'),
  },
};
