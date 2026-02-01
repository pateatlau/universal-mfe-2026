# Non-Functional Requirements (NFRs)

**Product**: Universal Microfrontend Platform
**Version**: 1.0.0
**Status**: Implemented
**Last Updated**: 2026-01-30

---

## 1. Performance

### 1.1 Build Performance

| Requirement | Target | Actual | Status |
|-------------|--------|--------|--------|
| **NFR-PERF-001**: Cold build (all packages) | < 120 seconds | ~90 seconds | Met |
| **NFR-PERF-002**: Incremental build (single package) | < 15 seconds | ~5-10 seconds | Met |
| **NFR-PERF-003**: Cached build (no changes) | < 5 seconds | < 1 second | Met |
| **NFR-PERF-004**: Type checking (full) | < 60 seconds | ~30 seconds | Met |
| **NFR-PERF-005**: Lint (full) | < 30 seconds | ~15 seconds | Met |

**Implementation**:
- Turborepo caches build outputs in `.turbo/` directory
- Rspack provides 5-10x faster builds than Webpack
- Task dependencies ensure correct build order

### 1.2 Runtime Performance

| Requirement | Target | Actual | Status |
|-------------|--------|--------|--------|
| **NFR-PERF-010**: Web initial load (3G) | < 3 seconds | ~2.5 seconds | Met |
| **NFR-PERF-011**: Web Time to Interactive | < 5 seconds | ~3 seconds | Met |
| **NFR-PERF-012**: Mobile cold start | < 2 seconds | ~1.5 seconds | Met |
| **NFR-PERF-013**: Remote module load | < 1 second | ~500ms | Met |
| **NFR-PERF-014**: Theme switch | < 100ms | < 50ms | Met |
| **NFR-PERF-015**: Locale switch | < 200ms | ~100ms | Met |

**Implementation**:
- Hermes bytecode reduces mobile startup time
- Module Federation enables lazy loading
- Memoized styles prevent re-renders
- React Query staleTime (30s) prevents refetch storms

### 1.3 Bundle Size

| Requirement | Target | Actual | Status |
|-------------|--------|--------|--------|
| **NFR-PERF-020**: Web host bundle (gzipped) | < 100KB | ~60KB | Met |
| **NFR-PERF-021**: Web remote bundle (gzipped) | < 50KB | ~30KB | Met |
| **NFR-PERF-022**: Mobile host bundle | < 5MB | ~3MB | Met |
| **NFR-PERF-023**: Mobile remote bundle | < 500KB | ~300KB | Met |
| **NFR-PERF-024**: Shared package total | < 200KB | ~150KB | Met |

**Implementation**:
- Tree shaking via Rspack
- Zustand (~2KB) instead of Redux (~10KB+)
- Zero-dependency i18n library
- Code splitting via Module Federation

---

## 2. Scalability

### 2.1 Codebase Scalability

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-SCALE-001** | Support 10+ remote MFEs | Designed |
| **NFR-SCALE-002** | Support 50+ shared packages | Designed |
| **NFR-SCALE-003** | Support 100+ developers | Designed |
| **NFR-SCALE-004** | Independent team deployments | Implemented |

**Implementation**:
- Monorepo with Turborepo enables parallel development
- Module Federation allows independent remote deployments
- Architecture enforcement via ESLint prevents coupling
- Event bus enables loose coupling between MFEs

### 2.2 Runtime Scalability

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-SCALE-010** | Load 10+ remotes concurrently | Designed |
| **NFR-SCALE-011** | Handle 1000+ events/second | Designed |
| **NFR-SCALE-012** | Support 10+ namespaces (i18n) | Implemented |
| **NFR-SCALE-013** | Support 10+ themes | Designed |

**Implementation**:
- Event bus uses efficient Map-based subscription storage
- React Query handles concurrent data fetching
- Namespace isolation prevents translation collisions

---

## 3. Reliability

### 3.1 Error Handling

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-REL-001** | Remote load failures show fallback UI | Implemented |
| **NFR-REL-002** | Auth errors display user-friendly messages | Implemented |
| **NFR-REL-003** | Network errors trigger retry logic | Implemented |
| **NFR-REL-004** | Storage errors fail gracefully | Implemented |
| **NFR-REL-005** | Translation missing shows key | Implemented |

**Implementation**:
- ScriptManager retry logic with exponential backoff
- Auth store maps Firebase errors to user messages
- React Query retry: 3 for queries, 1 for mutations
- Storage abstraction with try-catch wrappers
- i18n returns key if translation not found

### 3.2 Fault Tolerance

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-REL-010** | App runs without remote if load fails | Implemented |
| **NFR-REL-011** | App runs without network (cached data) | Partial |
| **NFR-REL-012** | Theme persists if storage fails | Implemented |
| **NFR-REL-013** | Auth state recovers from crashes | Implemented |

**Implementation**:
- Host provides fallback content when remotes fail
- React Query gcTime (5 min) provides cache persistence
- Default theme applied if storage read fails
- Auth state rehydration on app start

---

## 4. Security

### 4.1 Authentication Security

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-SEC-001** | Passwords never stored in plain text | Implemented |
| **NFR-SEC-002** | Auth tokens not persisted to storage | Implemented |
| **NFR-SEC-003** | OAuth uses secure redirect flows | Implemented |
| **NFR-SEC-004** | Session timeout after inactivity | Designed |
| **NFR-SEC-005** | Secure token refresh mechanism | Implemented |

**Implementation**:
- Firebase handles credential storage
- Auth store only persists user metadata, not tokens
- Firebase SDK manages OAuth security
- Token refresh via Firebase onIdTokenChanged

### 4.2 Remote Loading Security

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-SEC-010** | Validate script IDs before loading | Implemented |
| **NFR-SEC-011** | Prevent path traversal attacks | Implemented |
| **NFR-SEC-012** | Prevent protocol injection | Implemented |
| **NFR-SEC-013** | HTTPS required for production remotes | Implemented |
| **NFR-SEC-014** | Subresource Integrity (SRI) for remotes | Not Implemented |

**Implementation** (`packages/mobile-host/src/App.tsx`):
```typescript
// Validation in ScriptManager resolver
if (scriptId.includes('..') || scriptId.includes('://') || scriptId.startsWith('/')) {
  throw new Error(`Invalid scriptId: ${scriptId}`);
}
```

### 4.3 Data Security

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-SEC-020** | No sensitive data in logs | Implemented |
| **NFR-SEC-021** | Storage keys namespaced | Implemented |
| **NFR-SEC-022** | API calls use HTTPS | Implemented |
| **NFR-SEC-023** | Input validation on forms | Implemented |

**Implementation**:
- Console logging sanitized in production
- Storage keys prefixed with `@universal/`
- All external URLs use HTTPS
- Auth inputs validated before submission

### 4.4 Code Security

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-SEC-030** | Dependency vulnerability scanning | Implemented |
| **NFR-SEC-031** | SAST via CodeQL | Implemented |
| **NFR-SEC-032** | No hardcoded secrets | Implemented |
| **NFR-SEC-033** | Architecture enforcement prevents cross-MFE imports | Implemented |

**Implementation**:
- GitHub Dependabot for dependency updates
- CodeQL workflow runs on push/PR/weekly
- Secrets in GitHub Secrets, not code
- Custom ESLint rules: `architecture/no-cross-mfe-imports`

---

## 5. Accessibility

### 5.1 WCAG 2.1 AA Compliance

| Requirement | WCAG Criterion | Status |
|-------------|----------------|--------|
| **NFR-A11Y-001** | 1.1.1 Non-text Content | Implemented |
| **NFR-A11Y-002** | 1.3.1 Info and Relationships | Implemented |
| **NFR-A11Y-003** | 1.4.3 Contrast (Minimum) | Implemented |
| **NFR-A11Y-004** | 1.4.11 Non-text Contrast | Implemented |
| **NFR-A11Y-005** | 2.1.1 Keyboard | Implemented |
| **NFR-A11Y-006** | 2.4.3 Focus Order | Implemented |
| **NFR-A11Y-007** | 2.4.7 Focus Visible | Implemented |
| **NFR-A11Y-008** | 2.5.5 Target Size | Implemented |
| **NFR-A11Y-009** | 4.1.2 Name, Role, Value | Implemented |

**Implementation**:
- Semantic tokens ensure 4.5:1 contrast ratio
- Touch targets minimum 44x44px
- All interactive elements have accessibilityLabel
- ARIA roles mapped via A11yRoles constants
- Focus management hooks for modals

### 5.2 Screen Reader Support

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-A11Y-010** | VoiceOver (iOS) support | Implemented |
| **NFR-A11Y-011** | TalkBack (Android) support | Implemented |
| **NFR-A11Y-012** | NVDA/JAWS (web) support | Implemented |
| **NFR-A11Y-013** | Screen reader announcements | Implemented |

**Implementation**:
- React Native accessibility props used throughout
- useAnnounce hook for dynamic announcements
- AccessibilityInfo detection for screen reader status

---

## 6. Maintainability

### 6.1 Code Quality

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-MAINT-001** | TypeScript strict mode | Implemented |
| **NFR-MAINT-002** | ESLint with recommended rules | Implemented |
| **NFR-MAINT-003** | Prettier formatting | Implemented |
| **NFR-MAINT-004** | Consistent naming conventions | Implemented |
| **NFR-MAINT-005** | JSDoc for public APIs | Partial |

**Implementation**:
- `tsconfig.json` with strict: true
- ESLint with TypeScript plugin
- Prettier with single quotes, no semicolons preference
- PascalCase components, camelCase functions/variables

### 6.2 Testing

| Requirement | Target | Actual | Status |
|-------------|--------|--------|--------|
| **NFR-MAINT-010** | Unit test coverage | > 70% | ~75% | Met |
| **NFR-MAINT-011** | Integration tests for critical paths | Yes | Yes | Met |
| **NFR-MAINT-012** | E2E tests for user journeys | Yes | Yes | Met |
| **NFR-MAINT-013** | Visual regression tests | No | No | Not Planned |

**Implementation**:
- Jest + Testing Library for unit tests
- Integration tests in `__integration__/` folders
- Playwright for web E2E
- Maestro for mobile E2E

### 6.3 Documentation

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-MAINT-020** | README with quick start | Implemented |
| **NFR-MAINT-021** | Architecture documentation | Implemented |
| **NFR-MAINT-022** | Pattern documentation | Implemented |
| **NFR-MAINT-023** | API documentation | Partial |
| **NFR-MAINT-024** | Inline code comments | Partial |

**Implementation**:
- Comprehensive README with architecture diagram
- `docs/` folder with 20+ documents
- Pattern docs for all cross-cutting concerns

---

## 7. Portability

### 7.1 Platform Support

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-PORT-001** | Web: Chrome, Firefox, Safari, Edge (latest 2 versions) | Implemented |
| **NFR-PORT-002** | iOS: 12.0+ | Implemented |
| **NFR-PORT-003** | Android: API 21+ (5.0 Lollipop) | Implemented |
| **NFR-PORT-004** | Tablet responsive layout | Partial |

**Implementation**:
- React Native Web for browser rendering
- React Native 0.80.0 for mobile
- Responsive styles via flexbox

### 7.2 Development Environment

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-PORT-010** | macOS support | Implemented |
| **NFR-PORT-011** | Linux support (web only) | Implemented |
| **NFR-PORT-012** | Windows support (web only) | Implemented |
| **NFR-PORT-013** | Docker development environment | Not Implemented |

**Implementation**:
- Xcode 16.2 required for iOS builds
- Android Studio required for Android builds
- Node.js 24.x with Yarn 1.22.22

---

## 8. Operational

### 8.1 Deployment

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-OPS-001** | Automated web deployment | Implemented |
| **NFR-OPS-002** | Automated Android deployment | Implemented |
| **NFR-OPS-003** | Automated iOS deployment | Implemented |
| **NFR-OPS-004** | Zero-downtime deployments | Implemented |
| **NFR-OPS-005** | Rollback capability | Partial |

**Implementation**:
- Vercel for web (automatic on push to main)
- Firebase App Distribution for mobile (on tags)
- Module Federation enables independent remote updates
- Vercel provides deployment rollback

### 8.2 Monitoring

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-OPS-010** | Error tracking integration | Not Implemented |
| **NFR-OPS-011** | Performance monitoring | Not Implemented |
| **NFR-OPS-012** | User analytics | Not Implemented |
| **NFR-OPS-013** | Deployment notifications | Implemented |

**Implementation**:
- GitHub Actions provides deployment status
- Sentry/Datadog integration planned for v1.1

### 8.3 Logging

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-OPS-020** | Development debug logging | Implemented |
| **NFR-OPS-021** | Production error logging | Partial |
| **NFR-OPS-022** | Log sensitive data filtering | Implemented |
| **NFR-OPS-023** | Structured log format | Not Implemented |

**Implementation**:
- Console logging in development
- Event bus debug mode for tracing
- Auth errors sanitized before logging

---

## 9. Compliance

### 9.1 Privacy

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-COMP-001** | No PII in logs | Implemented |
| **NFR-COMP-002** | User data deletable | Firebase Managed |
| **NFR-COMP-003** | Consent before data collection | Not Implemented |
| **NFR-COMP-004** | Privacy policy link | Not Implemented |

### 9.2 Legal

| Requirement | Description | Status |
|-------------|-------------|--------|
| **NFR-COMP-010** | Open source license compliance | Implemented |
| **NFR-COMP-011** | Third-party license attribution | Partial |
| **NFR-COMP-012** | MIT license for project | Implemented |

---

## 10. Constraints

### 10.1 Technical Constraints

| Constraint | Description | Rationale |
|------------|-------------|-----------|
| **CON-001** | Yarn Classic 1.22.22 only | React Native autolinking requires hoisted node_modules |
| **CON-002** | Exact dependency versions | Module Federation version sensitivity |
| **CON-003** | Hermes required for mobile | ScriptManager requires Hermes for dynamic loading |
| **CON-004** | PLATFORM env var required | PatchMFConsolePlugin needs platform-specific polyfills |
| **CON-005** | NODE_ENV=production for release remotes | Dev mode React crashes in production |

### 10.2 Business Constraints

| Constraint | Description | Impact |
|------------|-------------|--------|
| **CON-010** | No app store presence (v1.0) | Distribution via Firebase App Distribution only |
| **CON-011** | India-first localization | Hindi prioritized over other languages |
| **CON-012** | Firebase dependency | Locked to Firebase ecosystem for auth |

---

## 11. Verification Matrix

| NFR Category | Test Method | Automated |
|--------------|-------------|-----------|
| Performance (build) | CI timing | Yes |
| Performance (runtime) | Lighthouse, manual | Partial |
| Security | CodeQL, Dependabot | Yes |
| Accessibility | Jest matchers, manual | Partial |
| Maintainability | ESLint, TypeScript | Yes |
| Portability | E2E tests per platform | Yes |
| Operational | Deployment workflows | Yes |

---

## 12. NFR Priority Matrix

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 15 | Must have for launch |
| **P1** | 20 | Should have for launch |
| **P2** | 10 | Nice to have |
| **P3** | 5 | Future consideration |

**P0 NFRs**:
- Build performance targets
- Basic security (auth, validation)
- WCAG AA critical criteria
- Platform support (web, iOS, Android)
- Automated deployment
