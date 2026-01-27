/**
 * Stub for React Native DevTools setup.
 *
 * In production builds, we replace the real setUpReactDevTools module with this stub
 * to prevent DevTools initialization and reduce bundle size.
 *
 * This stub is referenced by NormalModuleReplacementPlugin in rspack.config.mjs
 * when NODE_ENV === 'production'.
 */

// Export a no-op function to satisfy React Native's devtools setup interface
export default function setUpReactDevTools() {
  // No-op: DevTools are disabled in production
}
