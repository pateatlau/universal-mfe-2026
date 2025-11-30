constraints.md

Universal Web + Mobile Microfrontend Platform — Architectural Constraints & Boundaries
Status: Authoritative | Version: 1.0

1. Purpose

This document defines the non-negotiable architectural constraints that MUST be followed for the Universal Web + Mobile Microfrontend Platform to function correctly.

Following these constraints ensures:

Stable Module Federation behavior (web + mobile)

Reliable dynamic remote loading through ScriptManager

Correct bundling boundaries for Rspack and Re.Pack

Cross-platform consistency between React Native and React Native Web

Predictable TypeScript behavior

A maintainable, universal MFE codebase

These rules supersede all developer preferences and supersede all default tool behavior.

2. Global Core Rules
   2.1 One Universal UI API: React Native

All universal UI MUST be written using React Native primitives such as:

View

Text

Pressable

Image

SafeAreaView

etc.

❌ Forbidden in shared UI:

DOM elements (<div>, <span>, <button>, etc.)

Platform-specific styling shortcuts

Web-only hooks or APIs

✔️ Allowed:

RN primitives

Platform.select

Shared fonts, colors, spacing tokens

Universal components wrapped by RNW for web

2.2 Shared Libraries: Rules for All

Shared libraries MUST:

Contain pure TypeScript code only

Contain no environment-specific imports

❌ No Rspack-only imports

❌ No Re.Pack-only imports

❌ No Web APIs

❌ No Native APIs

NEVER import:

host apps

remote apps

any shell code

Allowed:

React/React Native imports

Utility functions

Cross-platform services

Type definitions

RN UI components located inside universal UI libs

2.3 No Static Imports of Remotes

Remotes MUST NOT be imported statically.

❌ Forbidden:
import HelloRemote from "hello-remote/HelloRemote"; // ILLEGAL

✔️ Required:
Web
import("hello_remote/HelloRemote");

Mobile
Federated.importModule("HelloRemote", "./HelloRemote", "default");

This is required for both security and correctness.

3. Bundling & Build Boundaries
   3.1 Web: Rspack Only

The following rules MUST be enforced:

All web hosts MUST be bundled by Rspack.

All web remotes MUST be bundled by Rspack.

Metro MUST NOT be used for web under any circumstances.

Web MF MUST use:

Rspack’s module federation plugin

Enhanced MF v2 runtime libraries (for manifest loading and runtime utilities)

3.2 Mobile: Re.Pack Only
❌ Forbidden:

Metro bundler

Webpack/webpack-cli

Any configuration not supported by Re.Pack

✔️ Required:

All mobile hosts and remotes MUST be bundled by Re.Pack.

All mobile MF MUST use ModuleFederationPluginV2.

3.3 Separation Between Web Bundles & Mobile Bundles

Even if both hosts share universal components, their remote bundles MUST remain isolated:

Web remote bundle

Mobile remote bundle

No cross-imports allowed.
Web cannot load mobile bundles.
Mobile cannot load web bundles.

4. Runtime Constraints
   4.1 Hermes Required

Mobile JavaScript engine MUST be:

Hermes

Why:

Required for ScriptManager execution

Required for MFv2 remote evaluation

Stable and predictable GC behavior

JSC cannot reliably execute MF remote bundles

4.2 ScriptManager MUST Be Initialized Before MF Runtime
✔️ Required:

Before ANY mobile remote is imported:

import { ScriptManager } from "@callstack/repack/client";

ScriptManager.addResolver(async (url) => {
return { url };
});

❌ Forbidden:

Calling Federated.importModule() before ScriptManager initializes

Loading remotes without a resolver

Using ScriptManager after MF runtime initialization

5. Workspace Constraints
   5.1 Yarn Classic (v1) REQUIRED

The monorepo MUST use Yarn Classic (v1).

❌ Prohibited:

pnpm

Yarn PnP

Yarn 3/4

npm workspaces

Why:

React Native toolchain assumes hoisted node_modules

Re.Pack requires standard filesystem layout

Autolinking behaves unpredictably with non-hoisted package managers

6. Directory Layout Constraints
   6.1 Required Package Layout
   root/
   packages/
   web-shell/
   web-remote-hello/
   mobile-host/
   mobile-remote-hello/
   shared-utils/
   shared-hello-ui/

Requirements:

No host code inside shared libs

No remote code inside hosts

No cross-importing between host packages

Shared UI MUST always be consumed via RN/RNW

7. Platform Requirements
   7.1 Web

ESM-only runtime

Modern browser support

7.2 Mobile

Android API Level 34+ for RN 0.80

iOS 16+

Modern Hermes VM

8. Non-Negotiable Summary

You MUST follow these at all times:

Re.Pack MUST be the mobile bundler.

Rspack MUST be the web bundler.

ScriptManager MUST handle remote loading on mobile.

Hermes MUST be the JS engine.

Universal UI MUST use React Native primitives.

Yarn v1 workspaces ONLY.

RN MUST be version 0.80/0.81.

Module Federation MUST be dynamic-only.

Violating ANY of these will break the architecture.
