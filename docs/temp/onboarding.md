/docs/onboarding.md

Universal Web + Mobile Microfrontend Platform — Developer Onboarding Guide
Version 1.0

1. Welcome

Welcome to the Universal Web + Mobile Microfrontend Platform — a cutting-edge architecture where:

Web uses Rspack

Mobile uses Re.Pack

Web uses Module Federation v2 (via @module-federation/enhanced/rspack)

Mobile uses Module Federation v2 (via Re.Pack)

Mobile remote loading is powered by ScriptManager

UI is universally written in React Native

Web rendering is handled by React Native Web

Everything is managed in a Yarn Classic (v1) monorepo

This onboarding guide will walk you through:

Prerequisites

Installing dependencies

Running the Web + Mobile shells

Running the Web + Mobile remotes

Understanding the architecture

Troubleshooting common issues

Development workflow and expectations

2. Prerequisites

Before working on the project, install the following:

System Requirements

macOS or Linux recommended

Windows requires WSL2 + Ubuntu

Core Dependencies

Node.js 24.x LTS

Yarn Classic v1.22.x

TypeScript 5.9.x

Xcode (for iOS builds)

Android Studio (for Android builds)

CocoaPods

Check Versions
node -v
yarn -v
tsc -v

Expected:

Node ≥ 24
Yarn = 1.22.x
TS = 5.9.x

3. Repository Setup

Clone the project:

git clone <repo-url>
cd <repo>

Install dependencies:

yarn install

This will install:

Web dependencies

Mobile dependencies

Shared code

Re.Pack + Rspack toolchains

IMPORTANT:
You MUST use Yarn v1, NOT Yarn PnP or Yarn v3+.

4. Project Structure Overview
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

Each package has its own app-level responsibilities.

5. Running the Web Platform
   5.1 Start Web Remote
   cd packages/web-remote-hello
   yarn dev

Default port: 9003

Visit:

http://localhost:9003/

This starts:

Rspack

RemoteEntry.js served via MF

Universal RNW component rendering

5.2 Start Web Shell
cd packages/web-shell
yarn dev

Default port: 9001

Visit:

http://localhost:9001/

Inside the shell, clicking “Load Remote” (or navigating) should load the remote component via:

import("hello_remote/HelloRemote")

If this works, web MF is functioning correctly.

6. Running the Mobile Platform

Mobile MF is more complex because it requires:

Hermes

Re.Pack

ScriptManager

MFv2 runtime

Native iOS/Android builds

6.1 Start Mobile Remote

This builds the remote as a native MFv2 bundle:

cd packages/mobile-remote-hello
yarn build:remote

This outputs:

dist/
HelloRemote.container.js.bundle
HelloRemote.container.js.bundle.map

Serve it via dev server:

yarn serve

Default port: 9004

6.2 Start Mobile Host
cd packages/mobile-host
yarn android

# or

yarn ios

When the app loads:

ScriptManager initializes

ScriptManager resolver returns the remote bundle URL

Remote bundle downloaded

Hermes evaluates bundle

MFv2 registers exposed components

UI renders inside the host

If you see the remote UI on Android/iOS → MFv2 + ScriptManager are working.

7. Testing the Universal UI

Universal UI lives in:

packages/shared-hello-ui/

Used by:

web-remote-hello

mobile-remote-hello

To verify:

Modify a shared RN component

Run both web-shell + mobile-host

Trigger remote loading

UI should update on BOTH platforms

8. Development Workflow
   8.1 Build universal UI first

Modify:

packages/shared-hello-ui/src/\*

Then reload both platforms.

8.2 Develop remotes in standalone mode

Web:

yarn dev

Mobile:

yarn build:remote
yarn serve

8.3 Integrate remotes into shells

Web shell dynamically loads via Module Federation v2 (using `@module-federation/enhanced/rspack`).
Mobile host dynamically loads via ScriptManager + MFv2 (using `Repack.plugins.ModuleFederationPluginV2`).

8.4 Keep bundler boundaries clean

Web ↔ mobile code MUST NOT mix

Shared libraries MUST remain pure

Only RN components belong in shared UI

Hosts must NOT statically import remote code

9. Common Issues & Fixes
   Issue: Mobile remote cannot load

Check:

ScriptManager resolver

Device/emulator connectivity

Correct bundle URL

Hermes enabled

Re.Pack bundler used (NOT Metro)

Issue: Web remote fails to load

Check:

remoteEntry.js URL

CORS

MF remote config

Issue: RN components crash on web

Check:

RNW version

Using DOM components instead of RN primitives

Incorrect styling (e.g., position: fixed in inappropriate places)

10. Verification Checklist
    Web

Web remote compiles

Web shell loads remote

RNW renders universal components

Mobile

ScriptManager initializes

Bundles served correctly

Hermes evaluates bundle

MFv2 remote loads

UI matches web

Shared

Shared UI updates appear everywhere

Shared utils behave identically

11. Summary

You now have a fully functioning:

Web MF architecture

Mobile MFv2 + ScriptManager architecture

Universal UI system

Shared cross-platform libraries

Yarn v1 workspace monorepo

This onboarding sets up developers for success across the entire Universal MFE Platform.
