/* eslint-env node */

/**
 * Rspack plugin to patch Module Federation runtime console calls
 *
 * Module Federation's runtime includes console.warn() calls that execute during
 * bundle initialization, but console doesn't exist in React Native release builds
 * until InitializeCore runs. This plugin:
 * 1. Prepends a console polyfill at the very start of the bundle (before webpack runtime)
 * 2. Replaces Module Federation console calls with safe no-ops as additional safety
 *
 * Why this is needed:
 * - Hermes doesn't have console available until React Native's InitializeCore runs
 * - InitializeCore is loaded as a webpack module, so it runs AFTER webpack runtime
 * - The polyfill ensures console exists before ANY code executes
 * - InitializeCore later replaces the polyfill with the real console implementation
 */

export default class PatchMFConsolePlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('PatchMFConsolePlugin', (compilation) => {
      // Iterate through all assets
      for (const filename in compilation.assets) {
        // Only patch .bundle files
        if (filename.endsWith('.bundle')) {
          try {
            const asset = compilation.assets[filename];
            let source = asset.source();

            if (typeof source !== 'string') {
              console.warn(`⚠ Skipping ${filename}: source is not a string`);
              continue;
            }

            // CRITICAL: Prepend console polyfill BEFORE all webpack code
            // React Native's console isn't available until InitializeCore runs,
            // but that's loaded as a webpack module. We need to ensure console exists
            // BEFORE webpack runtime code executes.
            const consolePolyfill = `
if (typeof console === 'undefined') {
  globalThis.console = {
    log: function() {},
    warn: function() {},
    error: function() {},
    info: function() {},
    debug: function() {},
    trace: function() {},
    table: function() {},
    group: function() {},
    groupEnd: function() {},
    groupCollapsed: function() {},
    assert: function() {},
    time: function() {},
    timeEnd: function() {},
    dir: function() {},
    dirxml: function() {},
    count: function() {},
    countReset: function() {},
    clear: function() {},
    profile: function() {},
    profileEnd: function() {}
  };
}
`;
            source = consolePolyfill + source;

            // Replace console.warn with a safe no-op in Module Federation runtime
            // We target the specific "[MF]" prefixed messages to avoid breaking legitimate console usage
            source = source.replace(
              /console\.warn\('\[MF\][^']*'\)/g,
              '(function(){})()'
            );

            // Update the asset with patched content
            compilation.assets[filename] = {
              source: () => source,
              size: () => source.length,
            };
            console.log(`✓ Prepended console polyfill and patched Module Federation console calls in ${filename}`);
          } catch (error) {
            console.error(`✗ Failed to patch ${filename}:`, error.message);
            throw error;
          }
        }
      }
    });
  }
}
