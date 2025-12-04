# POC-1 Implementation - High-Level Action Plan

**Date:** 2026-01-XX  
**Status:** 📋 **PLANNING** - Ready for Implementation  
**Context:** Universal MFE Platform - Payments System Foundation

---

## Executive Summary

POC-1 extends POC-0 by implementing:

- **Authentication system** with mock auth and RBAC
- **Payments system** foundation with role-based access
- **Routing infrastructure** using React Router 7
- **State management** using Zustand
- **Styling infrastructure** using Tailwind CSS v4
- **Testing infrastructure** using unified Jest approach

**Key Deliverables:**

- 2 new remote MFEs (Auth + Payments) for web and mobile
- 3-4 new shared packages (Auth store, Header UI, optional Auth/Payments UI)
- Updated shell/host with routing, auth flow, and universal header
- Complete testing infrastructure setup
- Full authentication and payments flow working on web, iOS, and Android

---

## Phase 1: Foundation & Infrastructure Setup (Week 1)

### 1.1 POC-0 Bug Fixes & Refactoring

**Priority:** High  
**Estimated Time:** 1-2 days

**Tasks:**

- [ ] Review POC-0 codebase for bugs and issues
- [ ] Fix identified bugs
- [ ] Refactor code for consistency and maintainability
- [ ] Update documentation as needed
- [ ] Optimize build configurations if needed

**Deliverables:**

- Bug fix list and resolutions
- Refactored code
- Updated documentation

---

### 1.2 Testing Infrastructure Setup

**Priority:** High  
**Estimated Time:** 3-4 days

**Decision:** Unified Jest approach for all packages (web, mobile, shared)

**Tasks:**

#### Shared Jest Infrastructure

- [x] Create shared Jest configuration base
- [x] Configure Jest for TypeScript (ts-jest)
- [x] Create shared test utilities
- [x] Establish testing patterns and conventions
- [x] Document testing strategy

#### Web Packages Setup

- [x] Install Jest 29.7.0 in `web-shell` and `web-remote-hello`
- [x] Install `@testing-library/react` 16.1.0
- [x] Install `@testing-library/jest-dom` 6.1.0
- [x] Configure Jest for web packages
- [x] Add test scripts (`test`, `test:watch`, `test:coverage`)

#### Mobile Packages Setup

- [x] Install Jest 29.7.0 in `mobile-host` and `mobile-remote-hello`
- [x] Install `@testing-library/react-native` 12.8.0
- [x] Configure Jest for React Native
- [x] Add test scripts

#### Shared Packages Setup

- [x] Install Jest 29.7.0 in `shared-utils` and `shared-hello-ui`
- [x] Configure Jest for shared packages
- [x] Add test scripts

#### Example Tests

- [x] Create example unit test for `shared-utils`
- [x] Create example unit test for `shared-hello-ui`
- [x] Create example unit test for web shell
- [x] Verify all tests run successfully

**Deliverables:**

- Jest configured for all packages
- Shared test utilities
- Example tests working
- Testing documentation

---

### 1.3 Core Dependencies Installation

**Priority:** High  
**Estimated Time:** 0.5 days

**Tasks:**

- [x] Install React Router 7.x in web-shell and mobile-host
- [x] Install Zustand (latest) in root and shared packages
- [x] Install Tailwind CSS v4.0+ in web packages
- [x] Verify NativeWind v4 compatibility with Tailwind v4 (Result: NativeWind v4 does NOT support Tailwind v4)
- [x] Install Uniwind (Tailwind v4 compatible) in mobile packages
- [x] Install `@react-native-async-storage/async-storage` in mobile packages
- [x] Verify all dependencies are exact versions (no ^ or ~)

**Deliverables:**

- All dependencies installed
- Version compatibility verified
- Dependency documentation updated

---

### 1.4 Tailwind CSS v4 Setup

**Priority:** High  
**Estimated Time:** 1-2 days

**Tasks:**

#### Web Setup

- [x] Configure Tailwind CSS v4 in web-shell
- [x] Configure Tailwind CSS v4 in web-remote-hello
- [x] Update PostCSS configuration
- [x] Integrate with Rspack
- [ ] Test Tailwind classes work correctly (KNOWN ISSUE: Classes not being applied - parked)
- [x] Verify build performance improvements

#### Mobile Setup

- [x] Verify NativeWind v4 compatibility with Tailwind v4 (Result: Not compatible, using Uniwind instead)
- [x] Install and configure Uniwind in mobile-host
- [x] Install and configure Uniwind in mobile-remote-hello
- [x] Integrate with Re.Pack
- [x] Test Tailwind classes work on mobile
- [x] Test on both Android and iOS

#### Shared Configuration

- [x] Create shared Tailwind config (where possible)
- [x] Document platform-specific overrides
- [x] Test styling consistency across platforms (mobile working, web needs fix)

**Deliverables:**

- Tailwind v4 working on web
- NativeWind working on mobile
- Shared configuration established
- Styling tested on all platforms

---

### 1.5 Shared Packages Creation

**Priority:** High  
**Estimated Time:** 2-3 days

**Tasks:**

#### Shared Auth Store (`@universal/shared-auth-store`) ✅

- [x] Create package structure
- [x] Setup TypeScript configuration
- [x] Install Zustand
- [x] Create User type with RBAC (ADMIN, CUSTOMER, VENDOR)
- [x] Implement AuthState interface
- [x] Implement Zustand store with:
  - User state
  - Authentication state
  - Login/logout/signup actions
  - Role-based access helpers (`hasRole`, `hasAnyRole`)
  - Session persistence logic (platform-agnostic)
- [x] Create mock authentication service
- [x] Add unit tests (54 tests, all passing, 94.28% coverage)
- [x] Build and verify package

#### Shared Header UI (`@universal/shared-header-ui`)

- [ ] Create package structure
- [ ] Setup TypeScript configuration
- [ ] Create UniversalHeader component using React Native primitives
- [ ] Implement branding/logo section
- [ ] Implement navigation items
- [ ] Implement logout button/link
- [ ] Add user info display (optional)
- [ ] Style with Tailwind classes
- [ ] Make responsive
- [ ] Add unit tests
- [ ] Build and verify package
- [ ] Test on web and mobile

#### Optional: Shared Auth UI (`@universal/shared-auth-ui`)

- [ ] Create package structure (if needed)
- [ ] Create reusable auth form components
- [ ] Style with Tailwind
- [ ] Add unit tests

#### Optional: Shared Payments UI (`@universal/shared-payments-ui`)

- [ ] Create package structure (if needed)
- [ ] Create reusable payments UI components
- [ ] Style with Tailwind
- [ ] Add unit tests

**Deliverables:**

- `shared-auth-store` package complete
- `shared-header-ui` package complete
- Optional packages if needed
- All packages tested and building

---

## Phase 2: Authentication MFE (Week 2)

### 2.1 Web Auth Remote (`web-remote-auth`)

**Priority:** High  
**Estimated Time:** 2-3 days

**Tasks:**

- [ ] Create package structure
- [ ] Setup Rspack configuration
- [ ] Configure Module Federation v2
- [ ] Setup Tailwind CSS v4
- [ ] Create SignIn component:
  - Form with email/password
  - Form validation
  - Error handling
  - Loading states
  - Integration with Zustand auth store
- [ ] Create SignUp component:
  - Form with email/password/name
  - Form validation
  - Error handling
  - Loading states
  - Integration with Zustand auth store
- [ ] Expose components via Module Federation:
  - `./SignIn`
  - `./SignUp`
- [ ] Style with Tailwind CSS
- [ ] Add unit tests
- [ ] Test standalone mode
- [ ] Build and verify

**Deliverables:**

- Web auth remote package complete
- SignIn and SignUp components working
- Module Federation configured
- Tests passing

---

### 2.2 Mobile Auth Remote (`mobile-remote-auth`)

**Priority:** High  
**Estimated Time:** 2-3 days

**Tasks:**

- [ ] Create package structure
- [ ] Setup Re.Pack configuration
- [ ] Configure Module Federation v2
- [ ] Setup NativeWind
- [ ] Create SignIn component (reuse logic from web):
  - Form with email/password
  - Form validation
  - Error handling
  - Loading states
  - Integration with Zustand auth store
- [ ] Create SignUp component (reuse logic from web):
  - Form with email/password/name
  - Form validation
  - Error handling
  - Loading states
  - Integration with Zustand auth store
- [ ] Expose components via Module Federation:
  - `./SignIn`
  - `./SignUp`
- [ ] Style with NativeWind
- [ ] Add unit tests
- [ ] Test on Android
- [ ] Test on iOS
- [ ] Build and verify

**Deliverables:**

- Mobile auth remote package complete
- SignIn and SignUp components working
- Module Federation v2 configured
- Tests passing on both platforms

---

### 2.3 Mock Authentication Implementation

**Priority:** High  
**Estimated Time:** 1 day

**Tasks:**

- [x] Implement mock authentication service in shared-auth-store ✅
- [x] Create mock user data with different roles:
  - ADMIN user (admin@example.com)
  - CUSTOMER user (customer@example.com)
  - VENDOR user (vendor@example.com)
- [x] Implement session persistence:
  - localStorage for web
  - AsyncStorage for mobile
- [x] Implement error handling
- [x] Add unit tests (54 tests, all passing, 94.28% coverage)
- [x] Document mock authentication flow

**Deliverables:**

- ✅ Mock authentication working
- ✅ Session persistence working
- ✅ Multiple user roles available
- ✅ Tests passing

**Note:** Completed as part of Phase 1.5 (`@universal/shared-auth-store` package).

---

## Phase 3: Payments MFE (Week 3)

### 3.1 Web Payments Remote (`web-remote-payments`)

**Priority:** High  
**Estimated Time:** 2-3 days

**Tasks:**

- [ ] Create package structure
- [ ] Setup Rspack configuration
- [ ] Configure Module Federation v2
- [ ] Setup Tailwind CSS v4
- [ ] Create PaymentsPage component:
  - Payments dashboard
  - Mock payment data display
  - List/table view of transactions
  - Role-based UI (VENDOR vs CUSTOMER)
- [ ] Implement role-based access control:
  - VENDOR: Can initiate payments, view reports
  - CUSTOMER: Can make payments, view own history
- [ ] Expose component via Module Federation:
  - `./PaymentsPage`
- [ ] Style with Tailwind CSS
- [ ] Add unit tests
- [ ] Test standalone mode
- [ ] Build and verify

**Deliverables:**

- Web payments remote package complete
- PaymentsPage component working
- RBAC implemented
- Tests passing

---

### 3.2 Mobile Payments Remote (`mobile-remote-payments`)

**Priority:** High  
**Estimated Time:** 2-3 days

**Tasks:**

- [ ] Create package structure
- [ ] Setup Re.Pack configuration
- [ ] Configure Module Federation v2
- [ ] Setup NativeWind
- [ ] Create PaymentsPage component (reuse logic from web):
  - Payments dashboard
  - Mock payment data display
  - List/table view of transactions
  - Role-based UI (VENDOR vs CUSTOMER)
- [ ] Implement role-based access control:
  - VENDOR: Can initiate payments, view reports
  - CUSTOMER: Can make payments, view own history
- [ ] Expose component via Module Federation:
  - `./PaymentsPage`
- [ ] Style with NativeWind
- [ ] Add unit tests
- [ ] Test on Android
- [ ] Test on iOS
- [ ] Build and verify

**Deliverables:**

- Mobile payments remote package complete
- PaymentsPage component working
- RBAC implemented
- Tests passing on both platforms

---

## Phase 4: Shell/Host Integration (Week 4)

### 4.1 Web Shell Updates

**Priority:** High  
**Estimated Time:** 3-4 days

**Tasks:**

#### Routing Setup

- [ ] Install React Router 7
- [ ] Configure browser router
- [ ] Define routes:
  - `/` - Redirect based on auth state
  - `/signin` - Sign-in page (unauthenticated)
  - `/signup` - Sign-up page (unauthenticated)
  - `/payments` - Payments page (authenticated, protected)
- [ ] Implement route protection:
  - Private routes require authentication
  - Redirect unauthenticated users to `/signin`
  - Redirect authenticated users away from auth pages

#### State Management Integration

- [ ] Integrate Zustand auth store
- [ ] Connect auth state to routing
- [ ] Implement auth state persistence on page load
- [ ] Test state synchronization

#### Universal Header Integration

- [ ] Import and integrate `shared-header-ui`
- [ ] Display header in authenticated state only
- [ ] Connect logout functionality
- [ ] Test header display

#### Remote Loading

- [ ] Update Module Federation config for new remotes:
  - `auth-mfe` (web-remote-auth)
  - `payments-mfe` (web-remote-payments)
- [ ] Implement dynamic remote loading:
  - Load auth-mfe for signin/signup routes
  - Load payments-mfe for payments route
- [ ] Test remote loading
- [ ] Test error handling

#### Authentication Flow

- [ ] Implement unauthenticated state:
  - Display signin/signup pages from auth-mfe
  - No header/navigation
  - Full-page auth experience
- [ ] Implement authenticated state:
  - Redirect to Payments page
  - Display universal header
  - Show logout link
  - Protected routes working
- [ ] Test full authentication flow
- [ ] Test logout flow

**Deliverables:**

- Web shell with routing working
- Authentication flow complete
- Remote loading working
- Universal header integrated
- All tests passing

---

### 4.2 Mobile Host Updates

**Priority:** High  
**Estimated Time:** 3-4 days

**Tasks:**

#### Routing Setup

- [ ] Install React Router 7
- [ ] Configure React Native router
- [ ] Define routes (same as web):
  - `/` - Redirect based on auth state
  - `/signin` - Sign-in page (unauthenticated)
  - `/signup` - Sign-up page (unauthenticated)
  - `/payments` - Payments page (authenticated, protected)
- [ ] Implement route protection:
  - Private routes require authentication
  - Redirect unauthenticated users to `/signin`
  - Redirect authenticated users away from auth pages

#### State Management Integration

- [ ] Integrate Zustand auth store
- [ ] Connect auth state to routing
- [ ] Implement auth state persistence on app load (AsyncStorage)
- [ ] Test state synchronization

#### Universal Header Integration

- [ ] Import and integrate `shared-header-ui`
- [ ] Display header in authenticated state only
- [ ] Connect logout functionality
- [ ] Test header display on mobile

#### Remote Loading

- [ ] Update Module Federation v2 config for new remotes:
  - `auth-mfe` (mobile-remote-auth)
  - `payments-mfe` (mobile-remote-payments)
- [ ] Implement dynamic remote loading via ScriptManager:
  - Load auth-mfe for signin/signup routes
  - Load payments-mfe for payments route
- [ ] Test remote loading
- [ ] Test error handling

#### Authentication Flow

- [ ] Implement unauthenticated state:
  - Display signin/signup pages from auth-mfe
  - No header/navigation
  - Full-page auth experience
- [ ] Implement authenticated state:
  - Redirect to Payments page
  - Display universal header
  - Show logout link
  - Protected routes working
- [ ] Test full authentication flow on Android
- [ ] Test full authentication flow on iOS
- [ ] Test logout flow

**Deliverables:**

- Mobile host with routing working
- Authentication flow complete
- Remote loading via ScriptManager working
- Universal header integrated
- All tests passing on both platforms

---

## Phase 5: Testing & Refinement (Week 5)

### 5.1 Unit Testing

**Priority:** High  
**Estimated Time:** 2-3 days

**Tasks:**

- [x] Write unit tests for shared-auth-store ✅ (54 tests, all passing)
- [ ] Write unit tests for shared-header-ui
- [ ] Write unit tests for web-shell components
- [ ] Write unit tests for web-remote-auth components
- [ ] Write unit tests for web-remote-payments components
- [ ] Write unit tests for mobile-host components (if applicable)
- [ ] Write unit tests for mobile-remote-auth components
- [ ] Write unit tests for mobile-remote-payments components
- [ ] Achieve minimum 70% code coverage
- [ ] Verify all tests pass

**Deliverables:**

- Comprehensive unit test coverage
- All tests passing
- Test coverage report

---

### 5.2 Integration Testing

**Priority:** Medium  
**Estimated Time:** 2-3 days

**Tasks:**

- [ ] Create integration tests for remote loading
- [ ] Create integration tests for Module Federation
- [ ] Create integration tests for shared dependencies
- [ ] Create integration tests for authentication flow:
  - Sign in flow
  - Sign up flow
  - Logout flow
  - Route protection
- [ ] Create integration tests for state synchronization
- [ ] Test cross-package integration
- [ ] Verify all integration tests pass

**Deliverables:**

- Integration tests for critical flows
- All integration tests passing

---

### 5.3 E2E Testing Setup (Maestro)

**Priority:** Medium  
**Estimated Time:** 2-3 days

**Tasks:**

- [ ] Install Maestro CLI
- [ ] Create Maestro test files (YAML):
  - Sign in flow
  - Sign up flow
  - Payments page access
  - Logout flow
- [ ] Configure for iOS
- [ ] Configure for Android
- [ ] Run E2E tests on Android
- [ ] Run E2E tests on iOS
- [ ] Document E2E test writing
- [ ] Set up CI/CD integration (optional)

**Deliverables:**

- Maestro configured
- Critical flow E2E tests working
- E2E tests passing on both platforms

---

### 5.4 Cross-Platform Testing

**Priority:** High  
**Estimated Time:** 2-3 days

**Tasks:**

- [ ] Test authentication flow on web
- [ ] Test authentication flow on Android
- [ ] Test authentication flow on iOS
- [ ] Verify code sharing (shared components work on all platforms)
- [ ] Verify consistent UX across platforms
- [ ] Test role-based access control:
  - VENDOR role functionality
  - CUSTOMER role functionality
- [ ] Performance testing
- [ ] Test error scenarios
- [ ] Test edge cases

**Deliverables:**

- All platforms tested
- Consistent behavior verified
- Performance acceptable
- Issues documented and fixed

---

### 5.5 Documentation & Refinement

**Priority:** High  
**Estimated Time:** 1-2 days

**Tasks:**

- [ ] Update architecture documentation
- [ ] Create POC-1 completion summary
- [ ] Document new packages:
  - shared-auth-store
  - shared-header-ui
  - web-remote-auth
  - mobile-remote-auth
  - web-remote-payments
  - mobile-remote-payments
- [ ] Update testing guide
- [ ] Document authentication flow
- [ ] Document routing setup
- [ ] Document state management approach
- [ ] Document styling approach
- [ ] Create developer guide for POC-1 features
- [ ] Fix any identified issues
- [ ] Code quality review
- [ ] Final review

**Deliverables:**

- Complete documentation
- POC-1 summary document
- All issues resolved
- Code quality verified

---

## Success Criteria Checklist

### Functional Requirements

- [ ] User can sign in (mock authentication)
- [ ] User can sign up (mock authentication)
- [ ] Authenticated users see payments page
- [ ] Unauthenticated users see signin/signup
- [ ] Logout redirects to signin
- [ ] Routes are protected (private routes)
- [ ] Universal header displays correctly
- [ ] Role-based access control works (VENDOR vs CUSTOMER)
- [ ] Works on web
- [ ] Works on Android
- [ ] Works on iOS

### Technical Requirements

- [ ] React Router 7 integrated and working
- [ ] Zustand stores shared between MFEs
- [ ] Tailwind CSS v4 working on web
- [ ] NativeWind working on mobile
- [ ] Maximum code sharing achieved
- [ ] All remotes load dynamically
- [ ] No static imports of remotes
- [ ] Module Federation v2 working correctly
- [ ] ScriptManager working on mobile

### Quality Requirements

- [ ] Code follows architectural constraints
- [ ] TypeScript types are correct
- [ ] No bundler-specific code in shared packages
- [ ] Unit tests passing (minimum 70% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing (critical flows)
- [ ] Documentation is complete and updated
- [ ] No linter errors
- [ ] Performance acceptable

---

## Risk Mitigation

| Risk                                           | Impact | Mitigation                                                            |
| ---------------------------------------------- | ------ | --------------------------------------------------------------------- |
| React Router 7 compatibility with React Native | High   | Test early, have React Navigation as fallback                         |
| Uniwind setup and Tailwind v4 compatibility    | Medium | Verify compatibility first, test early (NativeWind v4 not compatible) |
| Zustand store sharing across MFEs              | Medium | Design carefully, test state synchronization early                    |
| Code sharing limitations                       | Medium | Use React Native primitives, avoid platform-specific code             |
| Testing infrastructure complexity              | Medium | Start with shared infrastructure, build incrementally                 |
| Performance with multiple remotes              | Low    | Monitor bundle sizes, optimize if needed                              |

---

## Timeline Summary

| Phase                         | Duration | Key Deliverables                                                      |
| ----------------------------- | -------- | --------------------------------------------------------------------- |
| Phase 1: Foundation           | Week 1   | Testing infrastructure, dependencies, Tailwind setup, shared packages |
| Phase 2: Auth MFE             | Week 2   | Web and mobile auth remotes, mock authentication                      |
| Phase 3: Payments MFE         | Week 3   | Web and mobile payments remotes, RBAC                                 |
| Phase 4: Shell Integration    | Week 4   | Routing, state management, remote loading, auth flow                  |
| Phase 5: Testing & Refinement | Week 5   | Unit tests, integration tests, E2E tests, documentation               |

**Total Estimated Duration:** 5 weeks

---

## Next Steps

1. **Review and Approve:** Review this action plan and approve the approach
2. **Kickoff Phase 1:** Start with foundation and infrastructure setup
3. **Daily Standups:** Track progress and adjust as needed
4. **Document Learnings:** Document decisions and learnings as we go
5. **Iterate:** Follow phases, adjusting timeline as needed
6. **Deliver:** Complete POC-1 and prepare for POC-2

---

**Last Updated:** 2026-01-XX  
**Status:** 📋 Ready for Implementation
