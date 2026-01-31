# ADR-014: Firebase for Authentication

**Status**: Accepted
**Date**: 2026-01
**Decision Makers**: Platform Architecture Team

## Context

The platform needs authentication supporting:

1. **Email/password**: Traditional sign-up and sign-in
2. **Social providers**: Google, GitHub (minimum)
3. **Cross-platform**: Web and mobile (iOS, Android)
4. **Session management**: Token refresh, persistence
5. **Security**: Industry-standard practices

Options evaluated:
- **Firebase Authentication**: Google's auth service
- **Auth0**: Enterprise identity platform
- **AWS Cognito**: Amazon's identity service
- **Custom backend**: Build our own auth

## Decision

**Use Firebase Authentication** via the Firebase JavaScript SDK.

Implementation approach:
- Firebase SDK injected into auth store (dependency injection)
- No direct Firebase imports in shared code
- Host configures Firebase, provides to stores
- Auth state managed via Zustand

```typescript
// Host initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseApp = initializeApp(config);
const auth = getAuth(firebaseApp);

// Inject into auth store
configureAuthService(new FirebaseAuthService(auth));
```

## Consequences

### Positive

1. **Managed service**: No backend to build/maintain
2. **Cross-platform SDK**: Same API for web and mobile
3. **OAuth built-in**: Google, GitHub, etc. preconfigured
4. **Scalability**: Firebase handles millions of users
5. **Security**: Google's security infrastructure
6. **Free tier**: Generous limits for development/small scale

### Negative

1. **Vendor lock-in**: Tied to Google ecosystem
2. **SDK size**: Firebase SDK adds ~100KB
3. **Pricing at scale**: Can become expensive
4. **Limited customization**: Can't modify auth flows deeply
5. **Dependency**: Requires network for auth

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Firebase pricing changes | Low | Medium | Monitor costs; migration path exists |
| SDK breaking changes | Low | Medium | Pin SDK version; review changelogs |
| Outage affects app | Very Low | High | Error handling; offline mode planning |
| Data residency requirements | Medium | Medium | Firebase regions configurable |

## Alternatives Considered

### Alternative 1: Auth0

**Description**: Enterprise identity platform.

**Rejected because**:
- Higher cost at scale
- More complex configuration
- Overkill for current needs
- Firebase better integrated with other Firebase services

### Alternative 2: AWS Cognito

**Description**: Amazon's managed identity service.

**Rejected because**:
- More complex setup
- AWS SDK larger than Firebase
- Less intuitive for frontend devs
- No clear advantage for our use case

### Alternative 3: Custom Backend

**Description**: Build authentication service from scratch.

**Rejected because**:
- Significant development time
- Security expertise required
- OAuth integration complex
- Maintenance burden

### Alternative 4: Supabase Auth

**Description**: Open-source Firebase alternative.

**Rejected because**:
- Less mature than Firebase
- Smaller ecosystem
- Fewer OAuth providers out of box
- Firebase better for mobile

## Authentication Flows

### Email/Password

```typescript
// Sign up
const user = await authStore.signUpWithEmail(email, password);

// Sign in
const user = await authStore.signInWithEmail(email, password);

// Password reset
await authStore.sendPasswordResetEmail(email);
```

### OAuth Providers

```typescript
// Google
const user = await authStore.signInWithGoogle();

// GitHub
const user = await authStore.signInWithGitHub();
```

### Session Management

```typescript
// Auto-refresh tokens
onIdTokenChanged(auth, (user) => {
  if (user) {
    authStore.setUser(user);
  } else {
    authStore.clearUser();
  }
});

// Persistence
setPersistence(auth, browserLocalPersistence); // web
setPersistence(auth, reactNativeAsyncStorage); // mobile
```

## Error Handling

Firebase error codes mapped to user-friendly messages:

```typescript
const errorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered',
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/wrong-password': 'Incorrect password',
  'auth/user-not-found': 'No account found with this email',
  'auth/weak-password': 'Password must be at least 6 characters',
  'auth/popup-closed-by-user': 'Sign in was cancelled',
  // ... more mappings
};
```

## Architecture

```
┌─────────────────────────────────────────────┐
│                   Host                       │
│  ┌─────────────────────────────────────┐    │
│  │         Firebase SDK                 │    │
│  │   initializeApp()   getAuth()       │    │
│  └─────────────────────────────────────┘    │
│                    │                         │
│                    ▼                         │
│  ┌─────────────────────────────────────┐    │
│  │      FirebaseAuthService            │    │
│  │   (Implements AuthService)          │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│           shared-auth-store                  │
│  ┌─────────────────────────────────────┐    │
│  │         Zustand Store               │    │
│  │  - user state                       │    │
│  │  - loading state                    │    │
│  │  - error state                      │    │
│  │  - auth methods (via injected svc)  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│              MFEs / Components               │
│        useAuthStore() - read state          │
│        useUser() - selector hook            │
└─────────────────────────────────────────────┘
```

## Firebase Configuration

```typescript
// Environment-based config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ...
};
```

## Implementation

Location: `packages/shared-auth-store/`

Key files:
- `store.ts` - Zustand auth store
- `types.ts` - Auth types and interfaces
- `errors.ts` - Error code mappings

## References

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Firebase React Native](https://rnfirebase.io/)
