/**
 * DEPRECATED: Use PatchMFConsolePlugin.mjs instead
 *
 * This was a post-build script to patch Module Federation runtime console.warn calls.
 * It has been superseded by PatchMFConsolePlugin.mjs which:
 * 1. Runs automatically during build (no manual script execution)
 * 2. Prepends a console polyfill (more robust solution)
 * 3. Integrates seamlessly with CI/CD
 *
 * This file is kept for reference but is no longer used in builds.
 *
 * See:
 * - packages/mobile-host/scripts/PatchMFConsolePlugin.mjs (current solution)
 * - docs/PATCHMFCONSOLEPLUGIN-GUIDE.md (comprehensive guide)
 * - docs/MOBILE-RELEASE-BUILD-FIXES.md (why this was needed)
 *
 * @deprecated Since 2026-01-26 - Use PatchMFConsolePlugin.mjs
 */

const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../dist/index.bundle');

console.log('Patching Module Federation console calls...');

// Read the bundle
let bundle = fs.readFileSync(bundlePath, 'utf8');

// Replace console.warn with a safe no-op in Module Federation runtime
// We target the specific "[MF]" prefixed messages to avoid breaking legitimate console usage
bundle = bundle.replace(
  /console\.warn\('\[MF\][^']*'\)/g,
  '(function(){})()'
);

// Write the patched bundle back
fs.writeFileSync(bundlePath, bundle, 'utf8');

console.log('✓ Patched Module Federation console calls in bundle');
