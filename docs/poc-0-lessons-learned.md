
# Lessons Learned — POC‑0 Retrospective

POC‑0 was intentionally painful — it exercised every edge of RN + MFv2 + Rspack + Re.Pack.  
Here are the distilled learnings.

---

## 1. React Native + Module Federation is extremely sensitive to bundler outputs

**Key issues hit:**

- Wrong bundle filenames (`index.js` vs `index.bundle`)
- Wrong publicPath (`auto` breaks Hermes)
- Remote URL resolution using wrong IP
- Extra chunks not being resolvable
- Rspack emitting *web-style* chunks for RN

**Takeaway:**  
RN is not Webpack. Every MF bundle must be deliberately shaped for Hermes.

---

## 2. Re.Pack must be used consistently for ALL mobile builds

Switching between:

- `rspack build`
- `repack build`

caused inconsistent output and missing RN stubs.

**Takeaway:**  
All mobile remotes MUST be built using **Re.Pack**, never Webpack-style commands.

---

## 3. Shared libraries must be pure RN primitives

Errors like:

```
TypeError: Cannot read property 'OS' of undefined
TypeError: Cannot read property 'default' of undefined
```

were caused by:

- A remote bundling `react-native-web`
- Host expecting `react-native` only

**Takeaway:**  
Shared UI MUST be RN‑primitives only and version-aligned.

---

## 4. mf-manifest.json must reference RN bundles, not web bundles

MFv2 generates:

- `remoteEntry.js`
- `HelloRemote.container.js.bundle`
- Secondary chunks: `__federation_expose_*.bundle`

Host must load the `.bundle` versions.

**Takeaway:**  
Manifest rewriting rules must be part of POC‑1 tooling.

---

## 5. Android Emulator networking requires strict rules

- `localhost` → **host machine inside emulator = 10.0.2.2**
- Rspack dev server sometimes binds IPv6 first
- Webpack dev server auto‑redirects to IPv6

**Takeaway:**  
For mobile MFEs: always use `adb reverse` or fixed IPv4 address.

---

## 6. Repack stubs are required for missing RN DevTools internals

Missing modules required:

```
ReactDevToolsSettingsManager.js
NativeReactDevToolsRuntimeSettingsModule.js
```

Without these, remote bundles fail evaluations.

**Takeaway:**  
Stub files MUST be included in all mobile remotes.

---

## 7. Node_modules hoisting affects RN gradle builds

RN expects native Gradle plugin at:

```
node_modules/@react-native/gradle-plugin
```

When hoisted, Android build breaks.

**Takeaway:**  
mobile-host must keep RN dependencies local (non-hoisted).

---

## 8. Final Proof

Despite all challenges:

- Remote bundles load
- Hermes executes federation chunks
- Remote UI renders on RN
- Shared libs function cross‑platform

This validates the **entire Universal MFE architecture**.

---

