architecture-diagram.md
Universal Web + Mobile Microfrontend Platform — Architecture Diagrams

This document provides textual, structured, and hierarchical architecture diagrams that clearly illustrate:

Web host → web remotes

Mobile host → mobile remotes

Shared universal React Native UI

ScriptManager + Hermes runtime pipeline

Module Federation interactions

Monorepo boundaries

The diagrams intentionally avoid images to be fully compatible with Cursor and Markdown-based docs.

1.  High-Level System Diagram
    ┌───────────────────────────────────────────────────────────────────────────┐
    │ UNIVERSAL MICROFRONTEND PLATFORM (Monorepo) │
    │ Yarn v1 Workspaces + TypeScript + RN Universal UI │
    └───────────────────────────────────────────────────────────────────────────┘

                                 ┌───────────────┐
                                 │ Shared Utils  │
                                 │ (TS, no RN)   │
                                 └───────┬───────┘
                                         │
                                 ┌───────────────┐
                                 │ Shared UI     │
                                 │ (React Native)│
                                 └───────┬───────┘
                                         │
         ┌───────────────────────────────┴───────────────────────────────┐
         │                                                               │

    ┌───────────────┐ ┌─────────────────┐
    │ WEB SHELL │ │ MOBILE HOST │
    │ (Rspack + MF1)│ │(Re.Pack + MFv2) │
    └───────┬───────┘ └───────┬────────┘
    │ │
    │ │
    ┌───────▼────────┐ ┌────────▼──────────┐
    │ WEB REMOTE(S) │ │ MOBILE REMOTE(S) │
    │ (RNW + MF) │ │(RN + ScriptMgr+MFv2)│
    └─────────────────┘ └────────────────────┘

2.  Web Architecture Diagram (Rspack + Module Federation)
    ┌──────────────────────────┐
    │ WEB SHELL │
    │ (React 19 + Rspack) │
    └───────────┬──────────────┘
    │ Dynamic import()
    ▼
    ┌────────────────────────────┐
    │ remoteEntry.js (MF) │
    │ Exposes RNW components │
    └─────────────┬──────────────┘
    │
    ┌────────▼────────┐
    │ Web Remote MFE │
    │ (RN → RNW) │
    └─────────────────┘

3.  Mobile Architecture Diagram (Re.Pack + MFv2 + ScriptManager + Hermes)
    ┌─────────────────────────────────────┐
    │ MOBILE HOST APP │
    │ React Native + Re.Pack + MFv2 │
    │ Hermes Engine │
    └──────────────────┬──────────────────┘
    │
    │ ScriptManager.addResolver()
    ▼
    ┌───────────────────────────┐
    │ ScriptManager Resolver │
    │ (Returns URL for bundle) │
    └───────────┬───────────────┘
    │
    │ ScriptManager.prefetchScript()
    ▼
    ┌────────────────────────┐
    │ Remote Bundle (.bundle)│
    │ MFv2 container runtime │
    └───────────┬────────────┘
    │
    │ Hermes eval()
    ▼
    ┌──────────────────────┐
    │ Remote RN Component │
    └──────────────────────┘

4.  Universal Component Flow (RN → RNW / RN → Native)
    ┌────────────────────────────┐
    │ Shared UI (React Native) │
    └─────────────┬──────────────┘
    │
    ┌─────────────┴───────────────┐
    │ │
    ┌─────────────────────────┐ ┌────────────────────────┐
    │ WEB REMOTE (RNW render) │ │ MOBILE REMOTE (RN) │
    └──────────┬──────────────┘ └───────────┬────────────┘
    │ │
    RNW transforms RN RN renders natively
    │ │
    ┌──────────▼─────────┐ ┌──────────▼──────────┐
    │ DOM Host Platform │ │ Hermes + Native UI │
    └─────────────────────┘ └──────────────────────┘

5.  Monorepo Structure Diagram
    root/
    packages/
    web-shell/
    web-remote-hello/
    mobile-host/
    mobile-remote-hello/
    shared-utils/
    shared-hello-ui/

6.  Module Federation Boundary Diagram
    WEB HOST MOBILE HOST
    (Rspack MF v1) (Re.Pack MFv2)
    │ │
    │ │
    ▼ ▼
    REMOTE ENTRY JS REMOTE NATIVE BUNDLE
    MF v1 container MF v2 container
    │ │
    │ │
    RNW COMPONENT RN COMPONENT (Hermes)

7.  ScriptManager + MFv2 Runtime Integration Diagram
    ┌─────────────────────────────────────────────┐
    │ ScriptManager.addResolver() │
    │ → Returns URL for JS bundle │
    └─────────────────────────────────────────────┘
    │
    ▼
    ┌─────────────────────────────────────────────┐
    │ ScriptManager.prefetchScript() │
    │ → Downloads remote bundle │
    │ → Stores in cache │
    └─────────────────────────────────────────────┘
    │
    ▼
    ┌─────────────────────────────────────────────┐
    │ Hermes evaluates bundle │
    │ MFv2 runtime registers exposed modules │
    └─────────────────────────────────────────────┘
    │
    ▼
    ┌─────────────────────────────────────────────┐
    │ Federated.importModule("Remote", "./Comp") │
    └─────────────────────────────────────────────┘
