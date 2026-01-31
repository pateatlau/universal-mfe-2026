# ADR-004: Rspack as Web Bundler

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

We need a bundler for web applications that supports:

1. **Module Federation v2**: First-class MF support is essential
2. **Fast builds**: Development iteration speed matters
3. **Production optimization**: Tree shaking, code splitting, minification
4. **React Native Web**: Alias configuration for RN → RNW
5. **TypeScript**: Native or integrated TS support

Available options in 2025/2026:
- **Webpack 5**: Mature, slow, MF v1 native
- **Rspack**: Webpack-compatible, Rust-based, fast, MF v2 native
- **Vite**: Fast dev, different plugin ecosystem
- **Turbopack**: Next.js focused, early stage

## Decision

**Use Rspack v1.6.5** as the web bundler for both host and remotes.

Configuration highlights:
- `@module-federation/enhanced/rspack` for MF v2
- React Native Web alias: `react-native` → `react-native-web`
- TypeScript via `builtin:swc-loader`
- HTML generation via `@rspack/plugin-html`

```javascript
// rspack.config.mjs
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default {
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      // MF configuration
    }),
  ],
};
```

## Consequences

### Positive

1. **5-10x faster builds**: Rust core dramatically outperforms Webpack
2. **Webpack compatibility**: Most Webpack configs work with minimal changes
3. **Native MF v2**: No additional plugins needed
4. **Active development**: ByteDance actively maintains Rspack
5. **Growing ecosystem**: Increasing plugin availability

### Negative

1. **Newer tool**: Less community knowledge than Webpack
2. **Some plugins unavailable**: Not all Webpack plugins ported
3. **Documentation gaps**: Some advanced scenarios undocumented
4. **Breaking changes possible**: Pre-1.0 API may change (now 1.x stable)

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rspack abandoned | Very Low | High | Webpack fallback exists; configs similar |
| Plugin incompatibility | Low | Medium | Test plugins before adoption; alternatives exist |
| Build output differences | Low | Low | Test production builds thoroughly |

## Alternatives Considered

### Alternative 1: Webpack 5

**Description**: Industry standard bundler, Module Federation origin.

**Rejected because**:
- 5-10x slower than Rspack
- Development iteration speed matters
- MF v2 requires additional setup
- Rspack provides Webpack compatibility anyway

### Alternative 2: Vite

**Description**: Fast dev server, Rollup-based production builds.

**Rejected because**:
- Module Federation support via plugin (not native)
- Different config format (not Webpack-compatible)
- MF plugin less mature than Rspack native support
- Team expertise in Webpack patterns

### Alternative 3: Turbopack

**Description**: Vercel's Rust-based bundler for Next.js.

**Rejected because**:
- Tightly coupled to Next.js
- No standalone mode at evaluation time
- Module Federation not supported
- Not production-ready for non-Next.js projects

### Alternative 4: esbuild

**Description**: Extremely fast bundler written in Go.

**Rejected because**:
- No Module Federation support
- Limited plugin ecosystem
- Code splitting less sophisticated
- Not designed for complex app bundling

## Performance Comparison

| Bundler | Cold Build | Incremental Build | HMR |
|---------|-----------|-------------------|-----|
| Webpack 5 | ~60s | ~10s | ~500ms |
| Rspack | ~8s | ~1s | ~50ms |
| Vite | ~5s | ~0.5s | ~30ms |

*Approximate for medium-sized project; actual times vary.*

## References

- [Rspack Documentation](https://rspack.dev/)
- [Module Federation Enhanced](https://module-federation.io/guide/framework/rspack.html)
- [Rspack vs Webpack Comparison](https://rspack.dev/guide/migration/webpack)
