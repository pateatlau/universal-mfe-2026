/docs/developer-checklist.md

Universal MFE Platform — Developer Daily Checklist

Developer Checklist

This checklist is meant to be used daily by developers working on the Universal Web + Mobile Microfrontend Platform.

It focuses on:

Keeping architecture clean

Not breaking MF boundaries

Staying compatible with Re.Pack + ScriptManager + Rspack

Avoiding “just one small shortcut” that later explodes

1. Environment & Tooling

I am using Node 24.x LTS.

I am using Yarn Classic v1.22.x (not pnpm, not Yarn 3/4, not npm workspaces).

I ran yarn install at the repo root.

node -v, yarn -v, tsc -v match what’s documented in tech-stack-and-version-constraints.md.

2. Where is my code going?

Before writing code, I have answered:

Am I working on the web host? → then I’m editing packages/web-shell.

Am I working on a web remote? → then I’m editing packages/web-remote-\*.

Am I working on the mobile host? → then I’m editing packages/mobile-host.

Am I working on a mobile remote? → then I’m editing packages/mobile-remote-\*.

Am I writing shared logic? → then I’m editing packages/shared-utils.

Am I writing universal UI? → then I’m editing packages/shared-hello-ui or another shared UI package.

If my change touches more than two packages, I pause and think: is this design still clean?

3. Imports & Boundaries

Apps (hosts / remotes) import ONLY from:

Their own package, and

Shared libs (@universal/shared-\*)

Apps do not import from other apps:

❌ web-shell importing web-remote-hello

❌ mobile-host importing mobile-remote-hello

❌ web-shell importing mobile-host, etc.

Shared libs (shared-utils, shared-hello-ui) do not import:

Rspack

Re.Pack

ScriptManager

ReactDOM

Native modules

4. React Native / RN Web Usage

When editing universal UI:

I am using React Native primitives (View, Text, Pressable, etc.).

I am not using DOM elements (div, span, button).

I am not importing react-dom or react-native-web directly in shared UI.

Any platform-specific logic is done with Platform.select or small adapters.

5. Module Federation Usage
   Web

Web host uses dynamic imports only:

const Remote = React.lazy(() => import("hello_remote/HelloRemote"));

No static imports from remotes anywhere.

Mobile

Mobile host uses:

Federated.importModule("HelloRemote", "./HelloRemote");

No static imports from mobile remotes.

6. ScriptManager (Mobile Only)

mobile-host initializes ScriptManager in its bootstrap code.

A resolver is registered:

ScriptManager.shared.addResolver(async (scriptId) => ({ url: ... }));

Remotes are never loaded directly via fetch + eval manually.

Hermes is the active JS engine (JSC not used).

7. Building & Running
   Web

yarn dev works in web-remote-\* (remote visible on its dev URL).

yarn dev works in web-shell and it can load the remote.

Mobile

yarn build:remote works in mobile-remote-\*.

Remote bundle is reachable from emulator/simulator.

yarn android / yarn ios works in mobile-host and it can load the remote.

8. Before Opening a PR

I ran the relevant yarn dev / yarn build commands.

I verified web shell &/or mobile host loads the remote I changed.

I did not add any cross-app imports.

I did not change bundler configs casually — or if I did, I documented why and tested thoroughly.

I updated docs if behavior or contract changed.

9. If Something Feels Weird…

I check /docs/constraints.md.

I check /docs/architecture-overview.md.

I check /docs/architecture-diagram.md.

I ask: “Am I accidentally fighting the architecture?”
