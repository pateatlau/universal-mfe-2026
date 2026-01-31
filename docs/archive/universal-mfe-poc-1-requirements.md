# POC-1 Requirements & Architecture

**Status:** Planning  
**Version:** 1.0  
**Date:** 2026-01-XX

---

## 1. Overview

POC-1 extends POC-0 by implementing a payments system foundation with authentication, routing, state management, and styling infrastructure. This establishes the base architecture for future feature development.

---

## 2. Refined Requirements

### 2.1 Bug Fixes & Refactoring (POC-0)

**Scope:**

- Fix any identified bugs from POC-0
- Refactor code for maintainability and consistency
- Improve documentation
- Optimize build configurations
- Address any performance issues

**Deliverables:**

- Bug fix list and resolutions
- Refactored code with improved structure
- Updated documentation

---

### 2.2 New Remote MFEs

#### 2.2.1 Auth MFE (`auth-mfe`)

**Purpose:** Handle user authentication (signin/signup)

**Packages to Create:**

- `packages/web-remote-auth` - Web version
- `packages/mobile-remote-auth` - Mobile version

**Features:**

- Sign-in page/form
- Sign-up page/form
- Mock authentication (no real backend)
- Form validation
- Error handling
- Loading states

**Exposed Components:**

- `./SignIn` - Sign-in page component
- `./SignUp` - Sign-up page component
- `./AuthForm` - Shared form component (optional)

**State Management:**

- Local component state for forms
- Zustand store for authentication state (shared with shell)

**Styling:**

- Tailwind CSS (NativeWind for mobile)
- Responsive design
- Universal React Native primitives

---

#### 2.2.2 Payments MFE (`payments-mfe`)

**Purpose:** Display payments page after authentication

**Packages to Create:**

- `packages/web-remote-payments` - Web version
- `packages/mobile-remote-payments` - Mobile version

**Features:**

- Payments dashboard/page
- Mock payment data display
- Basic payment operations (mock)
- List/table view of transactions (mock)
- **Role-based access control:**
  - **VENDOR:** Can initiate payments, view reports
  - **CUSTOMER:** Can make payments, view own history
  - **ADMIN:** Full access (POC-2)

**Exposed Components:**

- `./PaymentsPage` - Main payments page component
- `./PaymentList` - List of payments (optional)

**State Management:**

- Local component state
- Zustand store for payments state (optional, for future)

**Styling:**

- Tailwind CSS (NativeWind for mobile)
- Universal React Native primitives

---

### 2.3 Shell/Host Updates

#### 2.3.1 Authentication Flow

**Unauthenticated State:**

- Display signin/signup pages from `auth-mfe`
- No header/navigation
- Full-page auth experience

**Authenticated State:**

- Redirect to Payments page from `payments-mfe`
- Display universal header with branding and navigation
- Show logout link in header
- Protected routes

**Authentication Mock:**

- Simple in-memory authentication
- Mock user data
- Session persistence (localStorage for web, AsyncStorage for mobile)
- No real backend integration

---

#### 2.3.2 Universal Header Component

**Features:**

- Branding/logo
- Navigation items
- Logout button/link
- User info display (optional)
- Responsive design

**Implementation:**

- Shared component in `packages/shared-header-ui` (new shared package)
- Uses React Native primitives
- Styled with Tailwind CSS
- Works on both web and mobile

**Layout Structure:**

```
┌─────────────────────────────────┐
│  Universal Header (Branding + Nav) │
├─────────────────────────────────┤
│                                 │
│  Content Area (Remote MFE)      │
│                                 │
│                                 │
└─────────────────────────────────┘
```

---

#### 2.3.3 Routing

**Technology:** React Router 7

**Web Implementation:**

- React Router 7 (browser router)
- Route protection (private routes)
- Redirect logic

**Mobile Implementation:**

- React Router 7 with React Native integration
- Stack navigation
- Route protection
- Deep linking support (future)

**Routes:**

- `/` - Redirect based on auth state
- `/signin` - Sign-in page (unauthenticated)
- `/signup` - Sign-up page (unauthenticated)
- `/payments` - Payments page (authenticated, protected)

**Route Protection:**

- Private routes require authentication
- Redirect unauthenticated users to `/signin`
- Redirect authenticated users away from auth pages

---

### 2.4 State Management

**Technology:** Zustand

**Stores to Create:**

1. **Auth Store** (`@universal/shared-auth-store`)

   - User authentication state
   - User data (mock)
   - Login/logout actions
   - Session management
   - Shared between shell and remotes

2. **App Store** (optional, in shell)
   - Global app state
   - Navigation state
   - Theme preferences (future)

**Store Structure:**

```typescript
// User type with RBAC
type UserRole = 'ADMIN' | 'CUSTOMER' | 'VENDOR';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  // Role-based access helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}
```

**Role-Based Access Control (RBAC):**

**Roles:**

- **ADMIN** - Full system access (functionality in POC-2)
- **CUSTOMER** - Can make payments
- **VENDOR** - Can initiate payments, view reports, etc.

**Permissions:**

- **VENDOR:**
  - ✅ Initiate payment
  - ✅ View reports
  - ✅ View payment history
  - ❌ Cannot make payments (only initiate)
- **CUSTOMER:**
  - ✅ Make payments
  - ✅ View own payment history
  - ❌ Cannot initiate payments
  - ❌ Cannot view reports
- **ADMIN:**
  - 🔄 Full system access (POC-2)

**Implementation:**

- Zustand works on both web and mobile
- **POC-1:** Shared store package for cross-MFE state (acceptable for POC)
- **POC-2:** Event bus for inter-MFE communication, Zustand only within single MFEs (decoupled)

---

### 2.5 Styling

**Technology:** Tailwind CSS

**POC-1 Approach: Inline Tailwind Classes**

- ✅ Direct inline Tailwind classes in components
- ✅ No design system component library
- ✅ Simple and fast for POC-1
- ✅ Full flexibility for rapid development

**Web Implementation:**

- Tailwind CSS v4.0+
- PostCSS configuration
- Rspack integration
- Inline utility classes

**Mobile Implementation:**

- Uniwind (Tailwind v4 for React Native)
- React Native integration
- StyleSheet compatibility
- Inline utility classes

**Shared Configuration:**

- Shared Tailwind config (where possible)
- Platform-specific overrides
- Universal React Native primitives only

**POC-2/POC-3: Design System (Future)**

- 🔄 Design system using Tailwind + shadcn/ui (web)
- 🔄 Mobile equivalent (Nativecn UI or Gluestack UI v2)
- 🔄 Reusable component library
- 🔄 Consistent design tokens
- 🔄 Shared component patterns

---

### 2.6 Code Sharing Strategy

**Maximum Code Sharing:**

- Shared UI components (React Native primitives)
- Shared business logic (TypeScript utilities)
- Shared state management (Zustand stores)
- Shared types/interfaces
- Shared validation logic
- Shared constants

**New Shared Packages:**

- `@universal/shared-auth-store` - Auth Zustand store
- `@universal/shared-header-ui` - Universal header component
- `@universal/shared-auth-ui` - Auth form components (optional)
- `@universal/shared-payments-ui` - Payments UI components (optional)

**Platform-Specific Code:**

- Routing configuration (web vs mobile)
- Navigation implementation
- Storage (localStorage vs AsyncStorage)
- Platform-specific utilities

---

## 3. High-Level Architecture

### 3.1 Package Structure

```
packages/
├── web-shell/                    # Web host (updated)
├── web-remote-hello/             # Existing web remote
├── web-remote-auth/              # NEW: Auth web remote
├── web-remote-payments/          # NEW: Payments web remote
├── mobile-host/                  # Mobile host (updated)
├── mobile-remote-hello/          # Existing mobile remote
├── mobile-remote-auth/           # NEW: Auth mobile remote
├── mobile-remote-payments/       # NEW: Payments mobile remote
├── shared-utils/                 # Existing shared utilities
├── shared-hello-ui/              # Existing shared UI
├── shared-auth-store/            # NEW: Auth Zustand store
├── shared-header-ui/             # NEW: Universal header component
├── shared-auth-ui/               # NEW: Auth form components (optional)
└── shared-payments-ui/           # NEW: Payments UI components (optional)
```

---

### 3.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Shell                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Router 7 + Zustand + Universal Header         │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│        ┌─────────────────┴─────────────────┐               │
│        │                                     │               │
│  ┌─────▼─────┐                      ┌──────▼──────┐        │
│  │ Auth MFE  │                      │ Payments MFE │        │
│  │ (Remote)  │                      │  (Remote)    │        │
│  └───────────┘                      └──────────────┘        │
│        │                                     │               │
│        └──────────────┬──────────────────────┘               │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │  Shared Stores  │                            │
│              │  (Zustand)      │                            │
│              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Mobile Host                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Router 7 + Zustand + Universal Header         │  │
│  │  ScriptManager + Module Federation v2                │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│        ┌─────────────────┴─────────────────┐               │
│        │                                     │               │
│  ┌─────▼─────┐                      ┌──────▼──────┐        │
│  │ Auth MFE  │                      │ Payments MFE │        │
│  │ (Remote)  │                      │  (Remote)    │        │
│  └───────────┘                      └──────────────┘        │
│        │                                     │               │
│        └──────────────┬──────────────────────┘               │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │  Shared Stores  │                            │
│              │  (Zustand)      │                            │
│              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.3 Data Flow

**Authentication Flow:**

1. User visits app → Check auth state (Zustand store)
2. If unauthenticated → Show signin/signup from `auth-mfe`
3. User submits form → Mock authentication → Update Zustand store
4. Store update → Router redirects to `/payments`
5. Shell loads `payments-mfe` → Displays payments page with header

**Logout Flow:**

1. User clicks logout in header
2. Zustand store `logout()` action → Clear user data
3. Router redirects to `/signin`
4. Shell loads `auth-mfe` → Displays signin page

**State Synchronization:**

- Zustand store is shared between shell and remotes
- Store updates trigger re-renders across MFEs
- No event bus needed for POC-1 (future enhancement)

---

### 3.4 Technology Stack

| Component        | Technology       | Version | Notes                     |
| ---------------- | ---------------- | ------- | ------------------------- |
| Routing          | React Router     | 7.x     | Works with React Native   |
| State Management | Zustand          | Latest  | Works on web and mobile   |
| Styling (Web)    | Tailwind CSS     | 3.x     | PostCSS + Rspack          |
| Styling (Mobile) | NativeWind       | Latest  | Tailwind for React Native |
| UI Primitives    | React Native     | 0.80.x  | Universal components      |
| Web Renderer     | React Native Web | 0.21.x  | Renders RN on web         |
| Storage (Web)    | localStorage     | Native  | Browser API               |
| Storage (Mobile) | AsyncStorage     | Latest  | React Native              |
| Bundler (Web)    | Rspack           | 1.6.x   | Existing                  |
| Bundler (Mobile) | Re.Pack          | 5.2.0   | Existing                  |

---

## 4. Implementation Plan

### Phase 1: Foundation & Setup (Week 1)

**Tasks:**

1. **Bug Fixes & Refactoring**

   - Review POC-0 issues
   - Fix identified bugs
   - Refactor code structure
   - Update documentation

2. **Install Dependencies**

   - React Router 7 (web and mobile)
   - Zustand
   - Tailwind CSS + NativeWind
   - AsyncStorage (mobile)

3. **Create Shared Packages**

   - `@universal/shared-auth-store` - Auth Zustand store
   - `@universal/shared-header-ui` - Universal header component
   - Update shared package configurations

4. **Setup Tailwind CSS**
   - Configure Tailwind for web (Rspack)
   - Configure NativeWind for mobile (Re.Pack)
   - Create shared design tokens
   - Test styling on both platforms

---

### Phase 2: Authentication MFE (Week 2)

**Tasks:**

1. **Create Web Auth Remote**

   - Setup `packages/web-remote-auth`
   - Configure Rspack + Module Federation
   - Create signin/signup components
   - Integrate with Zustand auth store
   - Style with Tailwind CSS
   - Test standalone mode

2. **Create Mobile Auth Remote**

   - Setup `packages/mobile-remote-auth`
   - Configure Re.Pack + Module Federation v2
   - Create signin/signup components (reuse logic)
   - Integrate with Zustand auth store
   - Style with NativeWind
   - Test on Android and iOS

3. **Mock Authentication**
   - Implement mock auth service
   - Create mock user data
   - Session persistence (localStorage/AsyncStorage)
   - Error handling

---

### Phase 3: Payments MFE (Week 3)

**Tasks:**

1. **Create Web Payments Remote**

   - Setup `packages/web-remote-payments`
   - Configure Rspack + Module Federation
   - Create payments page component
   - Mock payment data
   - Style with Tailwind CSS
   - Test standalone mode

2. **Create Mobile Payments Remote**
   - Setup `packages/mobile-remote-payments`
   - Configure Re.Pack + Module Federation v2
   - Create payments page component (reuse logic)
   - Mock payment data
   - Style with NativeWind
   - Test on Android and iOS

---

### Phase 4: Shell Integration (Week 4)

**Tasks:**

1. **Update Web Shell**

   - Integrate React Router 7
   - Setup route protection
   - Integrate Zustand auth store
   - Add universal header component
   - Dynamic remote loading (auth-mfe, payments-mfe)
   - Update Module Federation config
   - Test full authentication flow

2. **Update Mobile Host**

   - Integrate React Router 7 (React Native)
   - Setup route protection
   - Integrate Zustand auth store
   - Add universal header component
   - Dynamic remote loading via ScriptManager
   - Update Module Federation v2 config
   - Test full authentication flow

3. **Universal Header**
   - Implement header component
   - Branding/logo
   - Navigation items
   - Logout functionality
   - Responsive design
   - Test on both platforms

---

### Phase 5: Testing & Refinement (Week 5)

**Tasks:**

1. **Integration Testing**

   - Test authentication flow (web and mobile)
   - Test route protection
   - Test state synchronization
   - Test remote loading
   - Test logout flow

2. **Cross-Platform Testing**

   - Verify code sharing
   - Verify consistent UX
   - Test on Android, iOS, and Web
   - Performance testing

3. **Documentation**

   - Update architecture docs
   - Create POC-1 completion summary
   - Document new packages
   - Update testing guide

4. **Refinement**
   - Fix identified issues
   - Optimize performance
   - Improve code quality
   - Final review

---

## 5. Key Technical Decisions

### 5.1 React Router 7 for Mobile

**Decision:** Use React Router 7 with React Native integration

**Rationale:**

- Unified routing solution for web and mobile
- Supports route protection
- Works with React Native
- Active development and support

**Alternatives Considered:**

- React Navigation (mobile-only, would require separate solution for web)
- React Router 6 (older version)

---

### 5.2 Zustand for State Management

**Decision:** Use Zustand for MFE-level state management

**Rationale:**

- Lightweight and simple
- Works on both web and mobile
- No provider wrapping needed
- Good TypeScript support
- Easy to share between MFEs

**Alternatives Considered:**

- Redux (too heavy, complex setup)
- Context API (performance concerns, provider hell)
- Jotai (similar to Zustand, but Zustand is more mature)

---

### 5.3 Tailwind CSS + NativeWind

**Decision:** Use Tailwind CSS for web and NativeWind for mobile

**Rationale:**

- Consistent styling approach
- Utility-first CSS
- Good developer experience
- NativeWind bridges Tailwind to React Native
- Shared design tokens possible

**Alternatives Considered:**

- StyleSheet API only (less developer-friendly)
- Styled-components (runtime overhead)
- CSS Modules (not compatible with React Native)

---

### 5.4 Mock Authentication

**Decision:** Implement simple in-memory mock authentication

**Rationale:**

- POC-1 focus is on architecture, not real auth
- Faster development
- No backend dependency
- Can be replaced with real auth later

**Future Enhancement:**

- Replace with real authentication service
- OAuth integration
- JWT token management

---

## 6. Success Criteria

✅ **Functional Requirements:**

- [ ] User can sign in/sign up (mock)
- [ ] Authenticated users see payments page
- [ ] Unauthenticated users see signin/signup
- [ ] Logout redirects to signin
- [ ] Routes are protected
- [ ] Universal header displays correctly
- [ ] Works on web, Android, and iOS

✅ **Technical Requirements:**

- [ ] React Router 7 integrated and working
- [ ] Zustand stores shared between MFEs
- [ ] Tailwind CSS working on web and mobile
- [ ] Maximum code sharing achieved
- [ ] All remotes load dynamically
- [ ] No static imports of remotes

✅ **Quality Requirements:**

- [ ] Code follows architectural constraints
- [ ] TypeScript types are correct
- [ ] No bundler-specific code in shared packages
- [ ] Documentation is updated
- [ ] Tests pass (if applicable)

---

## 7. Out of Scope (Future)

**Not Included in POC-1:**

- Real authentication backend
- Event bus for inter-MFE communication
- Advanced payment features
- Real payment processing
- User profile management
- Advanced routing (deep linking, etc.)
- Performance optimizations (code splitting, lazy loading)
- Error boundaries and error handling (basic only)
- Analytics integration
- Theming system (basic styling only)

---

## 8. Risks & Mitigations

| Risk                                           | Impact | Mitigation                                                     |
| ---------------------------------------------- | ------ | -------------------------------------------------------------- |
| React Router 7 compatibility with React Native | High   | Research and test early, have fallback plan (React Navigation) |
| NativeWind setup complexity                    | Medium | Start early, follow documentation, test on both platforms      |
| Zustand store sharing across MFEs              | Medium | Design store structure carefully, test state synchronization   |
| Code sharing limitations                       | Medium | Use React Native primitives, avoid platform-specific code      |
| Performance with multiple remotes              | Low    | Monitor bundle sizes, optimize if needed                       |

---

## 9. Dependencies

**New Dependencies:**

- `react-router` v6.30.3 (v7 has Module Federation incompatibility)
- `zustand`
- `tailwindcss`
- `nativewind`
- `@react-native-async-storage/async-storage` (mobile)

**Existing Dependencies:**

- All POC-0 dependencies remain
- React Native 0.80.x
- React Native Web 0.21.x
- Rspack 1.6.x
- Re.Pack 5.2.0

---

## 10. Testing Strategy

### 10.1 Unit Testing - Jest (Unified Approach)

**Decision:** Use Jest for all packages (web, mobile, and shared)

**Rationale:**
- **Maximum code sharing** - Core Universal MFE Platform goal
- **Consistency** - Same framework, patterns, utilities everywhere
- **Required for React Native** - Jest is the standard for RN testing
- **Shared infrastructure** - Shared configs, utilities, patterns across all packages

**Implementation:**
- Jest 29.7.x for all packages
- `@testing-library/react` for web components
- `@testing-library/react-native` for mobile components
- Shared Jest configuration and test utilities
- ts-jest for TypeScript support

**Alternative Considered:**
- Vitest for web (rejected - would break code sharing goal and require maintaining two test frameworks)

---

### 10.2 E2E Testing - Maestro

**Decision:** Use Maestro for mobile E2E testing

**Rationale:**
- **Simpler setup** - YAML-based, no code required
- **Modern** - Built for modern mobile testing
- **Better developer experience** - Easier to write and maintain
- **Cross-platform** - Works on iOS and Android
- **No native dependencies** - Easier CI/CD setup

**Alternative Considered:**
- Detox (rejected - more complex setup, harder to maintain, more CI/CD overhead)

---

## 11. Next Steps

1. **Review and Approve:** Review this document and approve the approach
2. **Kickoff:** Start Phase 1 (Foundation & Setup)
3. **Iterate:** Follow the implementation plan, adjusting as needed
4. **Document:** Document learnings and decisions as we go
5. **Deliver:** Complete POC-1 and prepare for POC-2

---

**Last Updated:** 2026-01-XX  
**Status:** Planning
