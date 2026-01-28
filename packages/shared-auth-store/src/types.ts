/**
 * @universal/shared-auth-store
 *
 * Type definitions for authentication store.
 */

/**
 * User roles for Role-Based Access Control (RBAC)
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
}

/**
 * Authentication provider types
 */
export type AuthProvider = 'email' | 'google' | 'github' | 'anonymous';

/**
 * User interface - represents the authenticated user
 */
export interface User {
  /** Unique user identifier (Firebase UID) */
  id: string;
  /** User's email address */
  email: string | null;
  /** Display name */
  displayName: string | null;
  /** Profile photo URL */
  photoURL: string | null;
  /** Whether email is verified */
  emailVerified: boolean;
  /** User role for RBAC */
  role: UserRole;
  /** Auth provider used to sign in */
  provider: AuthProvider;
  /** Firebase ID token (for API calls) */
  idToken?: string;
  /** Token expiration timestamp */
  tokenExpiry?: number;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Current authenticated user (null if not authenticated) */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being loaded/verified */
  isLoading: boolean;
  /** Error message from last auth operation */
  error: string | null;
  /** Whether auth state has been initialized */
  isInitialized: boolean;
}

/**
 * Auth store actions
 */
export interface AuthActions {
  // Email/Password
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Social Login
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;

  // Session Management
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // State Management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // RBAC
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;

  // Initialization
  initializeAuth: () => Promise<() => void>;
}

/**
 * Combined auth store type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Auth service interface - implemented by platform-specific services
 */
export interface AuthService {
  // Email/Password
  signInWithEmail(email: string, password: string): Promise<User>;
  signUpWithEmail(email: string, password: string, displayName?: string): Promise<User>;
  resetPassword(email: string): Promise<void>;

  // Social Login
  signInWithGoogle(): Promise<User>;
  signInWithGitHub(): Promise<User>;

  // Session Management
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  refreshToken(): Promise<string | null>;

  // Auth State Listener
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

/**
 * Credentials for email sign-in
 */
export interface EmailCredentials {
  email: string;
  password: string;
}

/**
 * Sign-up data
 */
export interface SignUpData extends EmailCredentials {
  displayName?: string;
}
