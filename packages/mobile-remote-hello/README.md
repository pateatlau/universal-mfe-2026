# Mobile Remote Hello

Mobile remote microfrontend using Re.Pack + Module Federation v2.

## Build

Build the remote bundle:

```bash
yarn build:remote
```

This produces:
- `dist/HelloRemote.container.js.bundle`
- `dist/HelloRemote.container.js.bundle.map`

## Serve

Serve the bundle for development:

```bash
yarn serve
```

This starts a dev server on port 9004 serving the bundle at:
- `http://localhost:9004/HelloRemote.container.js.bundle`

## Architecture

- **Bundler**: Re.Pack 5.2.x
- **Module Federation**: v2 (ModuleFederationPluginV2)
- **Output**: `.container.js.bundle` format
- **Exposes**: `./HelloRemote` component

## Usage

The mobile host consumes this remote via ScriptManager + MFv2:

```typescript
const Remote = await Federated.importModule("HelloRemote", "./HelloRemote", "default");
```

