/docs/project-structure.md

Universal Web + Mobile Microfrontend Platform — Project Structure & Responsibilities
Version 1.0

1. Overview

This document defines the canonical directory & package structure for the Universal Web + Mobile Microfrontend Platform.

The structure is optimized for:

Yarn Classic (v1) workspaces

Universal React Native UI shared between platforms

Rspack (web)

Re.Pack (mobile)

Module Federation (web)

Module Federation v2 (mobile)

ScriptManager

Hermes

Strong bundling boundaries

Zero coupling between hosts

This structure MUST be followed for the architecture to function.

2. Root Directory Structure
   root/
   packages/
   web-shell/
   web-remote-hello/
   mobile-host/
   mobile-remote-hello/
   shared-utils/
   shared-hello-ui/
   docs/
   package.json
   yarn.lock
   tsconfig.json
   README.md

This model provides:

A clean separation between web vs mobile vs shared

Independent deployability of remotes

A universal library system

Simple Yarn workspace management

Predictable bundling boundaries for Rspack & Re.Pack

3. Package Responsibilities (Very Important)

Each package has a strict, non-negotiable responsibility.

This section is crucial for team onboarding & code review.

3.1 packages/web-shell

Role: Web Host (Container App)
Bundler: Rspack
MF Version: Module Federation (Web MF v1.5 + Enhanced)
UI Renderer: ReactDOM + React Native Web

Responsibilities:

Application routes

Runtime remote loading

Window-level layout (header, footer)

Consuming remote exposures from web remotes

React Native Web integration

Shared UI consumption

Web-only providers (analytics, theming, navigation)

MUST NOT:

Contain React Native-specific code

Import mobile host code

Import mobile remotes

Statically import remote modules

3.2 packages/web-remote-hello

Role: Web Remote MFE
Bundler: Rspack
MF Version: Web MF v1 (exposes components)
UI Renderer: React Native Web

Responsibilities:

Expose RNW-renderable universal components

Use universal shared libs (utils + RN UI)

Produce remoteEntry.js and runtime artifacts

Develop in standalone mode via dev server

MUST NOT:

Import host code

Use DOM components directly

Include mobile-only logic

Produce mobile bundles

3.3 packages/mobile-host

Role: Mobile Host (Super App Shell)
Bundler: Re.Pack
MF Version: Module Federation v2
Runtime Loader: ScriptManager
JS Engine: Hermes

Responsibilities:

Initialize ScriptManager

Register bundle resolvers

Prefetch remote bundles

Load MFv2 remote components at runtime

Provide navigation and global providers

Render universal React Native UI

MUST NOT:

Use Metro

Import web code

Statically import mobile remote components

Use Webpack’s ModuleFederationPlugin (mobile MUST use MFv2)

3.4 packages/mobile-remote-hello

Role: Mobile Remote MFE
Bundler: Re.Pack
MF Version: Module Federation v2
Runtime: Hermes

Responsibilities:

Expose RN-native components

Output .container.js.bundle for ScriptManager

Reuse universal shared code

Remain fully independent

MUST NOT:

Use RNW or any web-specific primitives

Import from mobile host

Hardcode bundle URLs

3.5 packages/shared-utils

Role: Universal Business Logic Library
Type: Pure TypeScript
Zero React / Zero Bundler-Specific Code

Responsibilities:

Constants

Helper functions

Formatting

Validation

Event bus utilities

Shared type definitions

MUST NOT:

Import RN

Import RNW

Import host/remote code

Use any bundler APIs

3.6 packages/shared-hello-ui

Role: Universal React Native UI Components
Renderers: RN (mobile) + RNW (web)

Responsibilities:

Pure RN components

Shared universal design system

Universal “HelloRemote” components

Props interfaces shared across all platforms

MUST:

Use only RN primitives

Avoid web DOM elements

Avoid platform-specific code unless using Platform.select()

Avoid host-specific dependencies

4. Strict Directory Boundaries

This is a critical section. Violating these boundaries WILL break Module Federation across web and mobile.

Directory Allowed Imports Forbidden Imports
web-shell shared libs mobile host/remote
web-remote-hello shared libs mobile packages
mobile-host shared libs web shell/remote
mobile-remote-hello shared libs web packages
shared-utils nothing from web or mobile RN, RNW, MF
shared-hello-ui shared-utils host/remotes

This prevents:

Cross-import cycles

Bundler contamination

Wrong-platform components

Invalid MF runtime behavior

5. Bundler-Specific Directory Rules
   5.1 Rspack cannot compile:

iOS native modules

Android code

Hermes runtime artifacts

Re.Pack configs

TypeScript files importing RN packages that are not supported on web

5.2 Re.Pack cannot compile:

RNW code

Web-only APIs

Browser global objects

Web-specific MF config

DOM elements

The project structure enforces these boundaries by design.

6. Recommended Scripts
   Root package.json
   yarn dev:web
   yarn dev:mobile
   yarn build

Web Remote
yarn dev
yarn build

Web Shell
yarn dev

Mobile Remote
yarn build:remote
yarn serve

Mobile Host
yarn android
yarn ios

7. Naming Conventions
   Type Naming Rule Example
   Web Shell web-shell ✔
   Web Remotes web-remote-_ web-remote-hello
   Mobile Host mobile-host ✔
   Mobile Remotes mobile-remote-_ mobile-remote-hello
   Shared TS shared-utils ✔
   Shared UI shared-hello-ui ✔
8. Code Owners & Review Rules
   Hosts require senior review

Changes to:

web-shell

mobile-host

require at least 1 senior approval because they affect the MF runtime.

Shared libs require extra caution

Because they influence both platforms.

Remotes can iterate quickly

They are isolated and safe to evolve independently.

9. Extending the Platform

To add a new feature:

yarn workspace web-remote-notification init
yarn workspace mobile-remote-notification init

Then expose via MF on both platforms.

10. Summary

This project structure ensures:

Clean separation between web & mobile

Strict module federation boundaries

Re.Pack + ScriptManager correctness

Universal React Native UI working seamlessly

This is the required structure for building a maintainable Universal MFE Platform.
