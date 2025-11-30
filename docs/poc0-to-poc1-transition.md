
# POC‑0 → POC‑1 Transition Plan

POC‑1 focuses on **stabilization**, **tooling**, and **scalability**.  
Below is a clean, actionable roadmap.

---

# 1. Stabilize Build System (High Priority)

### ✅ Deliverables
- Replace all raw Rspack usage with **Re.Pack wrappers**
- Introduce unified build scripts:
  - `build:mobile-remote`
  - `start:mobile-remote`
  - `serve:mobile-remote`
- Standardize output filenames:
  - `<RemoteName>.container.js.bundle`
  - `__federation_expose_<name>.bundle`

### 🎯 Goal
Zero ambiguity about what bundle the host loads.

---

# 2. Introduce Federation Manifest Rewriter

### Why
MFv2 emits web-centric manifests. We need RN-centric ones.

### Tasks
- Implement a post‑build script:
  - Convert remoteEntry paths → RN bundle paths
  - Remove web-only fields
  - Ensure valid URLs for federation chunks
- Validate for both dev & prod builds.

---

# 3. Shared Libraries Hardening

### Tasks
- Freeze RN version across all packages
- Freeze React version across all MFEs
- Add CI check: **fail if any MFE imports DOM elements**

### Deliverables
- `/shared/validation/no-dom-imports.js` script
- `/shared/validation/version-lock-check.js`

---

# 4. Mobile Host Enhancements

### Objectives
- Add Remote Registry
- Add dynamic remote config loader
- Add error boundaries around MF loading
- Provide a host navigation bridge to MFEs

### Example API

```ts
Host.registerRemote({
  id: "profile",
  url: "http://10.0.2.2:9010/Profile.container.js.bundle",
});
```

---

# 5. Web Host Enhancements

### Deliverables
- Web shell with MFv2 (Rspack) routing
- Basic auth flow stub
- Remote loading UI skeleton

---

# 6. Developer Tooling (POC‑1 Quality of Life)

### Tools to add
- `dev:mobile` single command (runs host + remote)
- `dev:web` command
- Automatic IP detection for Android remotes
- Watch mode rebuild for mobile-remote

---

# 7. CI/CD Only for POC‑1 (Not POC‑0)

### Deliverables
- Pipeline for mobile-remote build artifacts
- Pipeline for host
- Publish remote bundles to:
  - S3
  - or simple static hosting folder
- Automated manifest publishing step

---

# 8. Documentation

### Deliverables
- `/docs/poc1/build-system.md`
- `/docs/poc1/remote-conventions.md`
- `/docs/poc1/host-api.md`
- `/docs/poc1/developer-flow.md`

---

# 9. POC‑1 Exit Criteria (Definition of Done)

### ✔ Mobile Host loads 2+ remotes  
### ✔ Web Shell loads 2+ remotes  
### ✔ Shared libs used across all MFEs  
### ✔ Manifest rewriting fully automated  
### ✔ CI builds remote bundles  
### ✔ Dev environment: 1 command → everything runs  

---

# 10. POC‑2 Preview (For Later)

- Payments domain wiring
- Global event bus
- Auth service
- Navigation unification
- Versioned MF loading
- Production hosting standards

---

