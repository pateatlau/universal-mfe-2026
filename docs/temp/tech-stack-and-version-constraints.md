
# Tech Stack & Version Constraints

This document defines the official, locked-in technology stack and version constraints for the Universal Web + Mobile Microfrontend Platform.

The stack is optimized for:
- React 19
- React Native 0.80/0.81
- React Native Web 0.21
- Rspack (web bundler)
- Re.Pack (mobile bundler)
- Module Federation (web)
- Module Federation v2 (mobile)
- ScriptManager (native dynamic loader)
- Yarn Classic (v1) workspaces

---

# 1. Version Overview (Table)

| Technology | Recommended Version | Notes |
|-----------|---------------------|-------|
| Node.js | **24.11.x (LTS)** | Stable SWC/TS support |
| Yarn Classic (v1) | **1.22.22** | Best for RN monorepos |
| TypeScript | **5.9.x** | Ideal for React 19 |
| React | **19.2.0** | Latest stable |
| React Native | **0.80.x (primary)** / 0.81.x | Best compatibility with Re.Pack |
| React Native Web | **0.21.2** | Compatible with RN 0.80+ |
| Rspack | **1.6.x** | MF supported |
| Re.Pack | **5.2.x** | MFv2 + ScriptManager |
| Module Federation (Web) | MF v2 via @module-federation/enhanced/rspack | ✅ Migrated to v2 |
| Module Federation v2 (Mobile) | via Re.Pack 5.2.x | Tied to ScriptManager |
| ScriptManager | via Re.Pack 5.2.x | Required for dynamic bundles |
| Hermes | Bundled with RN 0.80.x | Required for MF |

---

# 2. Detailed Technology Breakdown

## 2.1 Node.js — 24.11.x
- Modern V8 engine, SWC, TypeScript compatibility.
- Best long-term support cycle.
- Stable for both Rspack and Re.Pack toolchains.

## 2.2 Yarn Classic (v1) — 1.22.22
- Required for stable React Native monorepos.
- Avoids pnpm/npm workspace issues with native modules.
- Ensures predictable node_modules layout for codegen & autolinking.

## 2.3 TypeScript — 5.9.x
- Fully supports React 19 JSX and types.
- Excellent for shared libraries.
- Fast and stable with SWC bundlers.

---

# 2.4 React — 19.2.0
- Latest stable React.
- Compatible with React Native’s 19.1.x internal version.
- React 19 improves performance and future features.

## 2.5 React Native — 0.80.x (primary)
- The safest AND most compatible version for Re.Pack 5.2.x.
- Supports both Legacy and New Architecture.
- Bundles Hermes by default.
- Avoid 0.82 for now (New Architecture only + ecosystem not caught up).

## 2.6 React Native Web — 0.21.2
- Recommended RNW version for RN 0.80+.
- Ensures compatibility with React 19.
- Supports modern styling and platform abstractions.

---

# 2.7 Rspack — 1.6.x
- Modern, Webpack-compatible bundler.
- Extremely fast builds.
- Uses Module Federation v2 via `@module-federation/enhanced/rspack`.
- Works seamlessly with RNW builds.

## 2.8 Re.Pack — 5.2.x
- Replaces Metro on mobile.
- Provides Module Federation v2 for React Native.
- Integrates ScriptManager natively.
- Supports RN 0.80 and 0.81 officially.

---

# 2.9 Module Federation (Web)
- Uses Module Federation v2 via `@module-federation/enhanced/rspack`.
- Provides MFv2 features:
  - Remote manifests
  - Runtime plugin
  - Lazy loading utilities
  - Enhanced lifecycle management

## 2.10 Module Federation v2 (Mobile)
- Provided by Re.Pack 5.2.x.
- Uses `ModuleFederationPluginV2`.
- Integrated tightly with ScriptManager for native dynamic loading.
- Enables “Super App” architecture on mobile.

---

# 2.11 ScriptManager — from Re.Pack 5.2.x
- Critical component for dynamic remote bundle loading.
- Required by Module Federation v2 on mobile.
- Manages bundle fetching, execution, caching.
- Fully Hermes-compatible.

---

# 2.12 Hermes — Bundled with RN 0.80.x
- Required for reliable dynamic bundle execution.
- Best performance and memory for mobile MF scenarios.
- Fully supported by Re.Pack + ScriptManager.

---

# 3. Platform Requirements

## Android
- API 34/35 for RN 0.80.x
- API 36 for RN 0.81.x

## iOS
- Xcode latest
- iOS 16+ minimum target

---

# 4. Summary

This is the recommended foundation for Universal Web + Mobile MF architecture:

- **React 19 + RN 0.80.x + RNW 0.21**
- **Rspack 1.6 (Web MF host)**
- **Re.Pack 5.2 (Mobile MFv2 host)**
- **ScriptManager (native runtime loader)**
- **Hermes (required)**
- **Yarn Classic (v1) monorepo**
- **TypeScript 5.9.x**

This stack maximizes stability and compatibility for the Universal MFE Platform across Web + Mobile.

