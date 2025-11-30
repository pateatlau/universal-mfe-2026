# Main Important Prompts used in this Project

## Prompt 0:

You are my Universal Web + Mobile MFE implementation assistant.

The project rules are already defined in .cursor/rules/project-rules.mdc (Always Apply) and MUST be obeyed strictly.

All architecture and constraints are documented in /docs, especially:

- /docs/architecture-overview.md
- /docs/constraints.md
- /docs/project-structure.md
- /docs/tech-stack-and-version-constraints.md
- /docs/how-to-add-a-new-remote.md
- /docs/how-to-deploy-remotes.md

We are now starting actual implementation from scratch. Your job is to help me implement the Universal MFE architecture step by step in this repo, using Yarn v1 workspaces, Rspack for web, Re.Pack + MFv2 + ScriptManager for mobile, and shared RN UI.

First, I want you to:

1. Inspect the docs I add.
2. Confirm your understanding of the project structure and constraints.
3. Propose a concrete implementation plan for POC-0 (minimal working web shell + web remote + shared libs, then mobile host + mobile remote).

## Prompt 1:

Given the attached docs, propose a concrete, step-by-step POC-0 implementation plan for this repo.

POC-0 should include:

- Yarn v1 workspace scaffolding
- shared-utils and shared-hello-ui packages
- web-shell + web-remote-hello (HelloRemote MFE loaded dynamically)
- mobile-host + mobile-remote-hello (HelloRemote loaded via MFv2 + ScriptManager)
- minimal RN UI component shared between web and mobile remotes

Keep the plan focused on small, testable steps that we can do one by one.

## Prompt 2:

Step 1: Create the Yarn v1 workspace and basic package skeletons, matching /docs/project-structure.md.

Please:

- Create root package.json with Yarn v1 workspaces configured.
- Create empty package.json + minimal src structure for:
  - packages/shared-utils
  - packages/shared-hello-ui
  - packages/web-shell
  - packages/web-remote-hello
  - packages/mobile-host
  - packages/mobile-remote-hello

Do NOT write any bundler configs yet. Just the basic TS/React/React Native project skeletons with correct dependencies, aligned to /docs/tech-stack-and-version-constraints.md.

## Prompt 3:

Now implement Step 2: shared libraries.

Using /docs/project-structure.md and /docs/constraints.md:

- Implement packages/shared-utils as a pure TypeScript library with:
  - A simple `getGreeting(name)` function.
- Implement packages/shared-hello-ui as a universal React Native UI library with:
  - A `HelloUniversal` component that uses React Native primitives only.
- Wire these libraries into the workspace (tsconfig paths, etc.).

Make sure no platform-specific or bundler-specific imports appear in shared libs.

## Prompt 4:

Now implement Step 3: web shell + web remote.

Goals:

- Rspack-based web-shell app that:
  - Renders a basic layout.
  - Dynamically loads HelloRemote via Module Federation.
- Rspack-based web-remote-hello app that:
  - Exposes "./HelloRemote" via MF.
  - Uses the shared `HelloUniversal` RN component via React Native Web.

Please:

1. Add Rspack config for web-shell and web-remote-hello.
2. Configure Module Federation on both sides, aligned with /docs/constraints.md.
3. Implement a minimal React entry file for each.
4. Provide instructions for running:
   - `web-remote-hello` dev server
   - `web-shell` dev server

## Prompt 5:

Now implement Step 4: mobile-host + mobile-remote-hello.

Goals:

- mobile-remote-hello:

  - Bundled with Re.Pack using ModuleFederationPluginV2.
  - Exposes "./HelloRemote".
  - Uses the shared `HelloUniversal` RN component.
  - Outputs a `.container.js.bundle` suitable for ScriptManager.

- mobile-host:
  - Bundled with Re.Pack (not Metro).
  - Uses ScriptManager for dynamic loading.
  - Calls Federated.importModule("HelloRemote", "./HelloRemote") to load the remote at runtime.
  - Renders HelloUniversal inside the host screen.

Please:

1. Add Re.Pack configs for mobile-host and mobile-remote-hello.
2. Wire ScriptManager correctly for Android (and iOS if possible).
3. Provide commands to:
   - Build/serve the mobile remote.
   - Run the host app on Android emulator.

## Prompt 6:
