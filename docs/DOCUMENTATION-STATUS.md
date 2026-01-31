# Documentation Status

**Last Updated:** 2026-01-30

## Current Structure

```
docs/
├── Core Documentation (active)
├── Requirements & Decisions
│   ├── PRD.md (Product Requirements)
│   ├── NFR.md (Non-Functional Requirements)
│   └── adr/ (Architecture Decision Records)
├── Pattern Documentation (active)
├── Future Plans (active but not yet implemented)
└── archive/ (historical, not maintained)
```

## Requirements & Architecture Decisions

### Requirements Documents

| Document | Purpose |
|----------|---------|
| `PRD.md` | Product Requirements Document - functional requirements, user stories |
| `NFR.md` | Non-Functional Requirements - performance, security, accessibility |

### Architecture Decision Records (ADRs)

Located in `docs/adr/`:

| ADR | Title |
|-----|-------|
| ADR-001 | Universal UI with React Native Primitives |
| ADR-002 | Module Federation v2 for Dynamic Loading |
| ADR-003 | Yarn Classic as Package Manager |
| ADR-004 | Rspack as Web Bundler |
| ADR-005 | Re.Pack as Mobile Bundler |
| ADR-006 | Hermes as Mobile JavaScript Engine |
| ADR-007 | Zustand for State Management |
| ADR-008 | Exact Version Pinning Strategy |
| ADR-009 | Two-Tier Design Token Architecture |
| ADR-010 | Event Bus for Inter-MFE Communication |
| ADR-011 | Host-Owned Routing Model |
| ADR-012 | PatchMFConsolePlugin Workaround |
| ADR-013 | India-First Localization Strategy |
| ADR-014 | Firebase for Authentication |
| ADR-015 | Turborepo for Build Orchestration |

## Active Documentation

### Core (Essential Reading)

| Document | Purpose |
|----------|---------|
| `ENTERPRISE-ENHANCEMENTS.md` | Overview of all enterprise features |
| `CI-CD-IMPLEMENTATION-PLAN.md` | CI/CD workflow reference |
| `MOBILE-RELEASE-BUILD-FIXES.md` | Critical production build fixes |
| `PATCHMFCONSOLEPLUGIN-GUIDE.md` | Hermes + MF v2 console fix guide |
| `GIT-FLOW-WORKFLOW.md` | Git workflow and branching |
| `universal-mfe-all-platforms-testing-guide.md` | Testing instructions |
| `universal-mfe-architecture-overview.md` | System architecture |
| `universal-mfe-mf-v2-implementation.md` | MF v2 configuration |
| `ANTI-PATTERNS.md` | Common mistakes to avoid |

### Patterns (Reference)

| Document | Topic |
|----------|-------|
| `PATTERNS-STATE-MANAGEMENT.md` | Zustand stores |
| `PATTERNS-DATA-FETCHING.md` | React Query |
| `PATTERNS-ROUTING.md` | Host-owned routing |
| `PATTERNS-THEMING.md` | Design tokens, themes |
| `PATTERNS-ACCESSIBILITY.md` | WCAG 2.1 AA |
| `PATTERNS-I18N.md` | Internationalization |
| `PATTERNS-EVENT-BUS.md` | Inter-MFE communication |
| `PATTERNS-TESTING.md` | Testing pyramid |

### Future Plans (Not Yet Implemented)

| Document | Status |
|----------|--------|
| `FIREBASE-AUTH-IMPLEMENTATION-PLAN.md` | Auth UI implemented, full auth flow in progress |
| `APP-STORES-RELEASE-PLAN.md` | Planned for production release |
| `INDIA-FIRST-LOCALIZATION-PLAN.md` | Hindi i18n completed, plan for India market |
| `TECH-STACK-UPGRADE-RECOMMENDATIONS.md` | Future upgrade guidance |

## Archived Documentation

The following files have been moved to `docs/archive/`. They are historical documents that are no longer actively maintained:

| File | Reason |
|------|--------|
| `universal-mfe-poc-1-requirements.md` | Phase 1 requirements - superseded by PRD.md |
| `CI-CD-CONTINUATION-PROMPT.md` | Internal continuation doc, not user-facing |
| `IOS-RELEASE-BUILD-IMPLEMENTATION.md` | Content consolidated into MOBILE-RELEASE-BUILD-FIXES.md |
| `REMOTE-DEPLOYMENT-GUIDE.md` | Content in CI-CD-IMPLEMENTATION-PLAN.md Phase 6.6 |
| `CI-CD-TESTING-GUIDE.md` | Merged into universal-mfe-all-platforms-testing-guide.md |
| `enhancements-implementation-plan.md` | Completed implementation checklist |
| `CRITICAL-ANALYSIS-OF-UNIVERSAL-MFE.md` | Historical analysis, may be outdated |

## Maintenance Notes

- **PRD.md** and **NFR.md** should be updated when requirements change
- **ADRs** are immutable once accepted; supersede with new ADR if decision changes
- Pattern docs should be updated when implementation changes
- CI-CD-IMPLEMENTATION-PLAN.md is the source of truth for deployment
- MOBILE-RELEASE-BUILD-FIXES.md is critical for production builds
