/* eslint-env node */

/**
 * Rspack plugin to patch React Native runtime initialization issues
 *
 * In React Native release builds with Hermes, certain global objects don't exist
 * until InitializeCore runs. This plugin polyfills them BEFORE bundle execution.
 *
 * Issues addressed:
 * 1. console - Module Federation runtime calls console.warn() during initialization
 * 2. Platform.constants - React Native's checkVersions() accesses this at module load time
 *
 * Why this is needed:
 * - Hermes doesn't have console/Platform available until React Native's InitializeCore runs
 * - InitializeCore is loaded as a webpack module, so it runs AFTER webpack runtime
 * - The polyfills ensure these exist before ANY code executes
 * - InitializeCore later replaces the polyfills with real implementations
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

            // CRITICAL: Prepend polyfills BEFORE all webpack code
            // React Native's console and Platform aren't available until InitializeCore runs,
            // but that's loaded as a webpack module. We need to ensure these exist
            // BEFORE webpack runtime code executes.
            const runtimePolyfills = `
// Console polyfill for Module Federation runtime
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

// Platform polyfill for React Native initialization
// Various React Native code accesses Platform properties at module load time
if (typeof __PLATFORM_POLYFILL__ === 'undefined') {
  globalThis.__PLATFORM_POLYFILL__ = true;

  // Create a polyfill Platform object that will be replaced when real Platform loads
  var _realPlatform = null;

  globalThis.__rn_platform_polyfill__ = {
    get constants() {
      if (_realPlatform !== null) return _realPlatform.constants;
      return {
        reactNativeVersion: { major: 0, minor: 80, patch: 0 },
        isTesting: false
      };
    },
    get isTesting() {
      if (_realPlatform !== null) return _realPlatform.isTesting;
      return false;
    },
    get OS() {
      if (_realPlatform !== null) return _realPlatform.OS;
      return 'ios';
    },
    get Version() {
      if (_realPlatform !== null) return _realPlatform.Version;
      return '';
    },
    select: function(obj) {
      if (_realPlatform !== null) return _realPlatform.select(obj);
      return obj.ios !== undefined ? obj.ios : obj.default;
    },
    // Setter to replace with real Platform when it loads
    __setRealPlatform: function(platform) {
      _realPlatform = platform;
    }
  };
}
`;
            source = runtimePolyfills + source;

            // Replace console.warn with a safe no-op in Module Federation runtime
            // We target the specific "[MF]" prefixed messages to avoid breaking legitimate console usage
            source = source.replace(
              /console\.warn\('\[MF\][^']*'\)/g,
              '(function(){})()'
            );

            // Patch ALL _Platform.default accesses to use our polyfill
            // This handles .constants, .isTesting, .OS, .select(), etc.
            source = source.replace(
              /(_Platform\.default)/g,
              '(__rn_platform_polyfill__)'
            );

            // Update the asset with patched content
            compilation.assets[filename] = {
              source: () => source,
              size: () => source.length,
            };
            console.log(`✓ Prepended runtime polyfills and patched Module Federation + Platform.constants in ${filename}`);
          } catch (error) {
            console.error(`✗ Failed to patch ${filename}:`, error.message);
            throw error;
          }
        }
      }
    });
  }
}
