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
# For Android (default)
yarn serve
# or explicitly
PLATFORM=android yarn serve

# For iOS
PLATFORM=ios yarn serve
```

**Port Configuration:**
- **Android**: Port 9004 (default)
- **iOS**: Port 9005

This allows simultaneous testing of both platforms. The dev server serves bundles at:
- **Android**: `http://localhost:9004/HelloRemote.container.js.bundle`
- **iOS**: `http://localhost:9005/HelloRemote.container.js.bundle`

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

