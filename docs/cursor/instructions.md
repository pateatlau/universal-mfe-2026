📌 PINNED NOTE — UNIVERSAL MFE PLATFORM (READ THIS BEFORE MAKING ANY CHANGE)

You are working inside a Universal Web + Mobile Microfrontend Platform.
All changes MUST obey the following architecture guidelines and repository rules.

This pinned note contains non-negotiable rules for all coding, editing, refactoring, or reasoning performed in this workspace.

1. IMPORTANT: ALWAYS OBEY THESE DOCUMENTS

All changes MUST follow the rules defined in:

- /docs/constraints.md
- /docs/architecture-overview.md
- /docs/architecture-diagram.md
- /docs/onboarding.md
- /docs/project-structure.md
- /docs/how-to-add-a-new-remote.md
- /docs/how-to-deploy-remotes.md
- /docs/tech-stack-and-version-constraints.md

If a suggestion conflicts with these docs, STOP and correct the suggestion.

2. PLATFORM TECHNOLOGY RULES (ABSOLUTE)

This platform is built on:

- React
- React Native
- React Native Web
- Rspack for web
- Re.Pack for mobile
- Module Federation for web
- Module Federation v2 for mobile
- ScriptManager for mobile dynamic loading
- Hermes on mobile
- Yarn Classic (v1) workspaces

These cannot be substituted.

3. BUNDLER BOUNDARIES (CRITICAL)

Web

- MUST use Rspack
- MUST use Module Federation (MF v1)
- Remote output MUST be remoteEntry.js

Mobile

- MUST use Re.Pack
- MUST use Module Federation v2
- MUST use ScriptManager
- Remote output MUST be .container.js.bundle
- Hermes MUST be enabled

NEVER DO:

- ❌ Use Metro for mobile
- ❌ Use Webpack/Webpack CLI for mobile
- ❌ Load mobile remote with anything except ScriptManager
- ❌ Import RN-specific code into web-only files
- ❌ Import RNW DOM code into mobile-only files

4. REMOTE LOADING RULES (MANDATORY)

Web:
import("remote_name/exposedModule");

Mobile:
Federated.importModule("RemoteName", "./ExposedModule");

❌ NEVER use static imports for remote modules.

5. UNIVERSAL UI RULES

Shared UI MUST be written using React Native primitives only:

- View, Text, Pressable, etc.
- No DOM components (div, span, etc.).
- No direct RNW imports inside shared UI.

Universal UI should run on web via RNW and mobile via RN.

6. MONOREPO RULES

Yarn v1 workspace structure:

```
  packages/
    web-shell/
    web-remote-_/
    mobile-host/
    mobile-remote-_/
    shared-utils/
    shared-hello-ui/
```

Allowed imports:

- host → shared utils
- host → shared RN UI
- remote → shared utils
- remote → shared RN UI

Forbidden imports:

- host ↔ host
- host ↔ remote
- remote ↔ remote
- shared libs importing:
  - ScriptManager
  - Rspack
  - Re.Pack
  - DOM APIs
  - Native Modules

7. MODEL USAGE GUIDANCE

Use the following for AI Actions:

- Opus 4.5 → architecture, debugging, config, MFv2/ScriptManager work
- Sonnet 4.5 → day-to-day coding
- Composer 1 → mechanical edits/boilerplate
- Avoid Auto for deep architecture tasks

8. WHEN UNSURE

- Check the docs
- Follow constraints
- Do NOT guess
- Ask for clarification if a user request violates the architecture
