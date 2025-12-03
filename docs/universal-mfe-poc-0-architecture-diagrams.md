
# Architecture Diagrams — Universal Web + Mobile MFE Platform (POC‑0)

Below are **text‑based architecture diagrams** suitable for GitHub docs.  
In POC‑1 these can be converted to draw.io / Mermaid.

---

## 1. Universal Microfrontend Platform — High‑Level Overview

```
                          +-------------------------------+
                          |        Monorepo (Nx)          |
                          |  universal-mfe-yarn-seed      |
                          +-------------------------------+
                                      |
         ---------------------------------------------------------------------
         |                                |                                 |
 +---------------+               +------------------+            +-------------------+
 | Web Shell     |               | Mobile Host      |            | Microservices     |
 | (Rspack)      |               | (Re.Pack + RN)   |            | Node.js services  |
 +---------------+               +------------------+            +-------------------+
         |                                |                                 |
     Remote MFEs                      Remote MFEs                      Auth / API / Payments
```

---

## 2. Mobile Host Architecture (Re.Pack + RN + MFv2)

```
+---------------- Mobile Host (Android/iOS) ----------------+
|                                                           |
|  React Native runtime + Hermes                            |
|  Re.Pack Dev Server (8081)                                |
|  Rspack bundler for RN (index.bundle)                     |
|                                                           |
|  Module Federation Runtime                                |
|  ---------------------------------------------            |
|  - loads manifest from remote                             |
|  - resolves URL: http://IP:9004/HelloRemote.container...  |
|  - loads secondary chunk: __federation_expose_...bundle   |
|                                                           |
|  App.tsx (Host Shell)                                     |
|     └── <Button /> → ScriptManager.loadRemote("Hello...") |
|                                                           |
+-----------------------------------------------------------+
```

---

## 3. Mobile Remote (HelloRemote) Build Pipeline

```
    packages/mobile-remote-hello/
            |
     repack.remote.config.mjs
            |
  +---------------------------+
  | Rspack (RN-target build) |
  +---------------------------+
            |
  Dist folder output:
    - HelloRemote.container.js.bundle
    - __federation_expose_HelloRemote.bundle
    - index.bundle
    - mf-manifest.json
```

---

## 4. Module Federation Data Flow (Mobile)

```
    Mobile Host                       Remote (Hello)
        |                                   |
        |-- Fetch manifest ---------------->|
        |<-- mf-manifest.json ------------- |
        |
        |-- GET HelloRemote.container.js -->|
        |<-- Bundle (global entry) ---------|
        |
        |-- GET exposed chunk --------------|
        |<-- __federation_expose...bundle --|
        |
        +--> Remote Component Renders
```

---

## 5. Universal Shared Libraries

```
@universal/shared-utils
    - getGreeting()

@universal/shared-hello-ui
    - HelloUniversal (RN primitives only)
         → Works in Web (RNW) & Mobile (RN)
```

---

## 6. POC‑0 Proven Architecture

```
• Web & Mobile both run MFEs
• No coupling between MFEs
• Host loads remote at runtime
• MFv2 wiring functional
• RN + Rspack + Re.Pack bundle chain validated
• RNW for web remote validated
• Shared libs resolve correctly
• Hermes executes MF chunks successfully
```

