/**
 * Firebase Authentication Service for Web
 *
 * Implements AuthService interface using Firebase JS SDK (modular v9+).
 *
 * This service provides:
 * - Email/Password authentication
 * - Google Sign-In (via popup)
 * - GitHub Sign-In (via popup)
 * - Session management
 * - Auth state listeners
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  linkWithCredential,
  type User as FirebaseUser,
  type AuthError,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { AuthService, User } from '@universal/shared-auth-store';
import { UserRole } from '@universal/shared-auth-store';

// Create auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add scopes for user profile and email
googleProvider.addScope('profile');
googleProvider.addScope('email');
githubProvider.addScope('user:email');

/**
 * Handle account-exists-with-different-credential error.
 *
 * Firebase doesn't allow automatic account linking for security reasons.
 * When this error occurs, the user must sign in with their original method first,
 * then link the new provider manually.
 *
 * @param error - The Firebase AuthError
 * @param providerName - Name of the provider that was attempted (for error message)
 */
function handleAccountExistsError(error: AuthError, providerName: string): never {
  // Extract email from the error if available
  const email = (error as AuthError & { customData?: { email?: string } }).customData?.email;

  const emailPart = email ? ` (${email})` : '';
  throw new Error(
    `An account already exists with this email${emailPart} using a different sign-in method. ` +
    'Please sign in with your original method first, then link this provider in account settings.'
  );
}

/**
 * Map Firebase user to our User type
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  // Determine provider from providerData
  const providerData = firebaseUser.providerData[0];
  let provider: User['provider'] = 'email';

  if (providerData?.providerId === 'google.com') {
    provider = 'google';
  } else if (providerData?.providerId === 'github.com') {
    provider = 'github';
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    role: UserRole.CUSTOMER, // Default role - could be fetched from Firestore
    provider,
  };
}

/**
 * Firebase Auth Service implementation for Web
 */
export const firebaseAuthService: AuthService = {
  // ===========================================================================
  // Email/Password Authentication
  // ===========================================================================

  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(result.user);
  },

  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name if provided
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    return mapFirebaseUser(result.user);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // ===========================================================================
  // Social Login (Popup-based)
  // ===========================================================================

  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return mapFirebaseUser(result.user);
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/account-exists-with-different-credential') {
        handleAccountExistsError(authError, 'Google');
      }
      throw error;
    }
  },

  async signInWithGitHub(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      return mapFirebaseUser(result.user);
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/account-exists-with-different-credential') {
        handleAccountExistsError(authError, 'GitHub');
      }
      throw error;
    }
  },

  // ===========================================================================
  // Session Management
  // ===========================================================================

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },

  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
  },

  async refreshToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    // Force refresh the token
    return user.getIdToken(true);
  },

  // ===========================================================================
  // Auth State Listener
  // ===========================================================================

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // Subscribe to Firebase auth state changes
    const unsubscribe = firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });

    return unsubscribe;
  },
};
