# Mobile Host

Universal MFE Mobile Host application using Re.Pack + Module Federation v2 + ScriptManager.

## Setup

This package requires React Native 0.80.x native projects. You may need to initialize them:

```bash
# From the mobile-host directory
cd packages/mobile-host

# Initialize React Native project structure (if not already present)
# Note: Re.Pack may require specific initialization
```

## Development

### Prerequisites

1. **Build and serve the mobile remote bundle** (in another terminal):
   ```bash
   cd packages/mobile-remote-hello
   yarn build:remote
   yarn serve  # Serves on port 9004
   ```

2. **Start the mobile host**:
   ```bash
   cd packages/mobile-host
   yarn android  # For Android
   # or
   yarn ios      # For iOS
   ```

## Architecture

- **Bundler**: Re.Pack 5.2.x (NOT Metro)
- **Module Federation**: v2 (via Re.Pack)
- **Runtime Loader**: ScriptManager
- **JS Engine**: Hermes (required)
- **Remote Loading**: `Federated.importModule("HelloRemote", "./HelloRemote", "default")`

## Configuration

- ScriptManager resolver configured in `src/App.tsx`
- Remote bundle URL: `http://localhost:9004/HelloRemote.container.js.bundle`
- Hermes enabled in `repack.config.mjs`

