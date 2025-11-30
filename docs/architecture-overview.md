architecture-overview.md

Universal Web + Mobile Microfrontend Platform — Architecture Overview
Version: 1.0

1. Introduction

This document defines the system-wide architecture for the Universal Web + Mobile Microfrontend Platform, built using:

React

React Native

React Native Web

Module Federation for web

Module Federation v2 for mobile

Rspack as web bundler

Re.Pack as mobile bundler

ScriptManager as mobile dynamic runtime loader

Hermes as the JavaScript engine for mobile

Yarn Classic (v1) for monorepo dependency management

TypeScript for static typing across all layers

This architecture solves the longstanding problem of building true universal microfrontends that run across Web + iOS + Android, using:

One codebase for UI (React Native)

Two bundlers (Rspack for Web, Re.Pack for Native)

Two MF runtimes (MF v1 for Web, MF v2 for Native)

One runtime loader for mobile (ScriptManager)

One shared monorepo with Yarn v1 workspaces

The result is a platform where:

Web Shell dynamically loads Web MF Remotes

Mobile Shell dynamically loads Native MF Remotes

Both shells can load remote features written with the same React Native UI code

Shared libraries unify business logic across the ecosystem

2. Universal MFE Architecture: High-Level Overview

At its core, the system is a dual-host microfrontend architecture:

Web Host

Bundled by Rspack

Uses Module Federation (MF v1.5 with optional v2 enhancements)

Loads remote modules at runtime

Uses React Native Web to render shared RN components

Mobile Host

Bundled by Re.Pack

Uses Module Federation v2

Loads remote bundles dynamically via ScriptManager

Runs inside Hermes VM

Renders pure React Native components

Shared Universal UI

Written 100% in React Native

Rendered on web via RNW

Rendered on mobile via RN

Shared between:

Web remotes

Mobile remotes

Web shell

Mobile shell

3. Monorepo Structure

The platform uses Yarn Classic v1 Workspaces with a flat node_modules layout, required by the RN & Re.Pack toolchains.

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

3.1 Design Principles

1. Hosts Are Independent

Web and Mobile hosts do NOT share bundler configuration.

They do NOT import from each other.

They communicate exclusively through MF runtime at the remote-consumption boundary.

2. Remotes Are Independent

Remotes produce:

A Web bundle (remoteEntry.js)

A Mobile bundle (HelloRemote.container.js.bundle)

Each remote is independently deployable.

3. Shared Libraries Are Pure

Shared code must remain free of:

Host-specific dependencies

Remote-specific dependencies

Bundler dependencies

Native modules

Shared code MUST always be universal TypeScript or universal RN UI.

4. Web Architecture (Rspack + Module Federation)
   4.1 Web Shell
   Responsibilities:

Application routing (React Router or similar)

User session handling

Remote feature loading at runtime

UI composition (header, nav, layout)

Runtime communication with remotes (events, props)

Technologies:

React 19

Rspack

Module Federation

React Native Web (to render universal RN UI)

Web Shell Example MF Config:
new ModuleFederationPlugin({
name: "web_shell",
remotes: {
hello_remote: "hello_remote@http://localhost:9003/remoteEntry.js",
},
shared: ["react", "react-dom", "react-native-web"]
});

4.2 Web Remote
Responsibilities:

Expose one or more React Native components

Bundle as a remoteEntry.js

Reuse shared libraries and shared UI components

Remain compatible with RNW runtime

Remote Exposure Example:
exposes: {
"./HelloRemote": "./src/app/HelloRemote",
}

5. Mobile Architecture (Re.Pack + Module Federation v2 + ScriptManager)

Mobile MF is significantly more advanced than web MF because it deals with:

Native bundle files

Hermes evaluation

React Native runtime constraints

ScriptManager integration

MF v2 metadata & manifest resolution

5.1 Mobile Host (Super App Shell)
Responsibilities:

Initialize ScriptManager

Register ScriptManager resolvers

Prefetch remote bundles (optional)

Load remote features dynamically

Compose navigation (React Navigation)

Provide global contexts & providers

Technologies:

React Native 0.80.x

Hermes

Re.Pack 5.2.x

ModuleFederationPluginV2

ScriptManager

Host Initialization Sequence:
import { ScriptManager, Federated } from "@callstack/repack/client";

ScriptManager.addResolver(async (scriptId) => {
return { url: `http://localhost:9004/${scriptId}` };
});

ScriptManager.prefetchScript("HelloRemote");

const Remote = await Federated.importModule("HelloRemote", "./HelloRemote", "default");

This ensures the remote is fetched, cached, evaluated, and rendered.

5.2 Mobile Remote (Remote Bundle)
Responsibilities:

Expose React Native components

Produce a native bundle file (\*.container.js.bundle)

Register itself to Module Federation v2 runtime

Support Hermes evaluation & ScriptManager

Build Output Example:
dist/
HelloRemote.container.js.bundle
HelloRemote.container.js.bundle.map

6. Universal React Native Components

This is the MOST IMPORTANT part of the system.

6.1 Why Universal UI Works

RN components run natively on iOS and Android

RNW maps RN components to DOM on web

Rspack bundles them for web

Re.Pack bundles them for mobile

Both hosts can load the SAME remote component

This achieves true "universal MFEs".

6.2 Universal UI Example
import { View, Text, Pressable } from "react-native";

export function HelloButton() {
return (
<Pressable>
<View>
<Text>Hello Universal MF!</Text>
</View>
</Pressable>
);
}

This component can be:

Rendered in web-remote-hello → loaded by web-shell

Rendered in mobile-remote-hello → loaded by mobile-host

Shared via shared-hello-ui

7. Data Flow, Events & State
   7.1 Recommended Approach

Use a simple, shared, event or message bus.

Examples:

Shared utility event-bus

Host-to-remote props

Callback props

Context passed from host to remote

7.2 Anti-Patterns

❌ No global Redux store shared between host and remote
❌ No attempting to sync state between web and mobile directly
❌ No coupling between hosts

8. Remote Loading Lifecycle
   8.1 Web (Rspack MF)

Host fetches remoteEntry.js

Host initializes remote container

Host loads exposed components

Component rendered via RNW

8.2 Mobile (Re.Pack MFv2 + ScriptManager)

Host resolves remote script URL

ScriptManager fetches remote bundle

Hermes evaluates remote script

MFv2 runtime registers exposed modules

Host imports exposed module

Component rendered natively in RN

This is the closest equivalent ever created to native "super app" architecture.

9. Platform Differences Summary
   Feature Web Mobile
   Bundler Rspack Re.Pack
   MF Version MF v1 (enhanced) MF v2
   Runtime Loader Browser ScriptManager
   JS Engine Browser VM Hermes
   UI Renderer ReactDOM + RNW React Native
   Remote Bundle remoteEntry.js \*.container.js.bundle
10. Required Version Matrix
    Layer Version
    React 19.2.0
    React Native 0.80.x (recommended)
    React Native Web 0.21.2
    Rspack 1.6.x
    Re.Pack 5.2.x
    ScriptManager Bundled with Re.Pack
    Hermes RN-bundled
11. Security, Stability & Deployment Recommendations
    Web Remotes

Host remote entries on CDN or web server

Cache aggressively

Ensure CORS correctness

Mobile Remotes

Serve bundles via HTTPS server

Add ScriptManager caching configurations

Sign bundles if needed (recommended for production)

Maintain backward compatibility using MFv2 semantic versioning

12. Summary

This architecture enables:

Universal UI with React Native

Web MF via Rspack + RNW

Mobile MF via Re.Pack + ScriptManager + Hermes

Independent deployable remotes across both platforms

Cross-platform shared libraries

Dynamic loading of remote features on all platforms

A modular super-app design

It is modern, stable, scalable, and fully feasible with your chosen stack.
