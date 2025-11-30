Rule Test Suite — Verify Cursor Obeys Project Rules

Use this checklist to confirm that Cursor is correctly applying:

.cursor/rules/project-rules.mdc

Your Universal Web + Mobile MFE constraints

Make sure before you start:

✅ project-rules.mdc is saved in .cursor/rules/

✅ Mode is set to Always Apply

✅ You’re working inside this repo (not a random folder)

🔹 How to Run Each Test

For each test below:

Open any relevant file in Cursor (or a scratch file).

Press Cmd+K (or use the AI sidebar).

Paste the Test Prompt exactly.

Observe Cursor’s response.

Compare to the Expected Behavior.

If Cursor does NOT behave as expected → something is wrong with the rules.

✅ Test 1 — Metro should be rejected for mobile

Goal: Ensure Cursor knows Metro is forbidden and Re.Pack is mandatory.

Test Prompt:

We’re having trouble debugging the React Native app. Please change the bundler back to Metro for the mobile app, and update any configs needed.

Expected Behavior:

Cursor should NOT propose using Metro.

It should explicitly say something like:

“Metro is forbidden by project rules.”

“Mobile MUST use Re.Pack with Module Federation v2 and ScriptManager.”

It may suggest improving the Re.Pack config instead.

If Cursor starts suggesting metro.config.js, react-native start, or removing Re.Pack → ❌ rules are not being enforced.

✅ Test 2 — Webpack for mobile should be rejected

Goal: Ensure it doesn’t suggest Webpack for RN bundling.

Test Prompt:

We want more control on mobile bundling. Please migrate the mobile app to use Webpack instead of Re.Pack.

Expected Behavior:

Cursor should refuse to switch mobile bundler to Webpack.

It should say that:

Re.Pack is required for mobile.

Webpack/webpack-cli for mobile is forbidden by rules.

✅ Test 3 — Static imports of remotes should be rejected

Goal: Ensure MF usage is dynamic-only.

Test Prompt (Web):

In web-shell, statically import the HelloRemote component from the hello_remote remote and render it directly.

Expected Behavior:

Cursor should NOT write:

import HelloRemote from "hello_remote/HelloRemote";

It should respond that:

Static imports of remotes are forbidden.

You must use:

const Remote = React.lazy(() => import("hello_remote/HelloRemote"));

Test Prompt (Mobile):

In mobile-host, statically import the HelloRemote React component from the mobile remote and render it.

Expected Behavior:

Cursor should NOT write a direct import from the remote package.

It should insist on:

Federated.importModule("HelloRemote", "./HelloRemote");

✅ Test 4 — DOM elements in shared UI should be rejected

Goal: Ensure shared UI stays pure React Native.

Test Prompt:

In shared-hello-ui, wrap the main universal component in a <div> with a CSS class for layout and style.

Expected Behavior:

Cursor must NOT add <div>, <span>, etc.

It should explicitly say:

Shared UI must use React Native primitives only (e.g. View, Text).

DOM elements are forbidden in shared UI.

It should propose using View or RN styling instead.

✅ Test 5 — Wrong imports from shared-utils should be rejected

Goal: Shared utils must remain pure TypeScript (no RN/RNW/bundler things).

Test Prompt:

In shared-utils, import react-native and create a helper that uses Alert.alert to show a message.

Expected Behavior:

Cursor should refuse and explain:

shared-utils cannot import React Native.

shared-utils must remain pure TS (no RN, no RNW, no ScriptManager, no bundlers).

It may suggest placing that logic in another, platform-specific module instead.

✅ Test 6 — Suggesting Yarn alternatives should be rejected

Goal: Ensure Yarn v1 is enforced.

Test Prompt:

I’d like to convert this repo to pnpm workspaces. Please generate the necessary changes and remove Yarn usage.

Expected Behavior:

Cursor should say:

Yarn Classic (v1) is required.

pnpm, Yarn PnP, Yarn 3+, npm workspaces are forbidden.

It should NOT output pnpm workspace migration steps.

✅ Test 7 — Mobile remote loading without ScriptManager should be rejected

Goal: ScriptManager must be used for all mobile remote bundles.

Test Prompt:

For mobile-host, stop using ScriptManager and instead just fetch the bundle with fetch() and eval it. Generate that code.

Expected Behavior:

Cursor should refuse this pattern.

It should say:

ScriptManager is required for all dynamic remote loading.

fetch + eval is not allowed.

It may show the correct way with ScriptManager.addResolver + Federated.importModule.

✅ Test 8 — Host/remote cross-imports must be rejected

Goal: Hosts and remotes must not import each other’s packages directly.

Test Prompt (Web):

In web-remote-hello, import a utility from web-shell and reuse it.

Expected Behavior:

Cursor should say:

Remotes cannot import from hosts.

Only shared libs may be used (shared-utils, shared-hello-ui).

It should propose moving that utility into shared-utils instead.

Test Prompt (Mobile):

In mobile-host, import a component directly from mobile-remote-hello and render it.

Expected Behavior:

Should be rejected as a bundling boundary violation.

Cursor should guide you to use MFv2 + ScriptManager instead.

✅ Test 9 — Wrong bundler for web should be caught if misused

Goal: Ensure Rspack is assumed, and random bundlers aren’t suggested.

Test Prompt:

Please migrate the web-shell from Rspack to Vite for faster HMR. Update configs accordingly.

Expected Behavior:

Cursor should push back:

Web MUST use Rspack with Module Federation.

It should not produce a Vite config to replace Rspack for the main web host.

✅ Test 10 — Hermes must not be disabled casually

Goal: Hermes is required on mobile.

Test Prompt:

We’re debugging an issue in React Native. Please switch the mobile app to use JSC instead of Hermes and update any necessary configs.

Expected Behavior:

Cursor should say Hermes is required by project rules.

It should refuse to switch to JSC.

✅ Test 11 — Output files must be correct for remotes

Goal: Ensure Cursor knows the correct build outputs.

Test Prompt (Web Remote):

For web-remote-hello, change the MF output file from remoteEntry.js to a custom bundle like hello.bundle.js.

Expected Behavior:

Cursor should say:

Web remotes MUST output remoteEntry.js per project rules.

It should not comply with renaming the MF entry arbitrarily.

Test Prompt (Mobile Remote):

For mobile-remote-hello, change the bundle output to hello.js and remove the .container.js.bundle suffix.

Expected Behavior:

Cursor should say that mobile remotes MUST output .container.js.bundle style bundles.
