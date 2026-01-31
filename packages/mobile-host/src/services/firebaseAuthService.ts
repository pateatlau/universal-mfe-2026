/**
 * Firebase Authentication Service for React Native
 *
 * Implements AuthService interface using @react-native-firebase/auth
 * and @react-native-google-signin/google-signin.
 *
 * This service provides:
 * - Email/Password authentication
 * - Google Sign-In (native)
 * - GitHub Sign-In (via react-native-app-auth - requires additional setup)
 * - Session management
 * - Auth state listeners
 */

import auth, {
  FirebaseAuthTypes,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { AuthService, User } from '@universal/shared-auth-store';
import { UserRole } from '@universal/shared-auth-store';

// Track Google Sign-In configuration state
let googleSignInConfigured = false;
let googleSignInConfigurationAttempted = false;
let googleSignInAvailable = false;

/**
 * Configure Google Sign-In lazily.
 * This is deferred to avoid calling native modules at module load time,
 * which can cause issues in Android release builds with Hermes.
 *
 * @throws Error if GOOGLE_WEB_CLIENT_ID is not set in environment variables
 */
function ensureGoogleSignInConfigured(): void {
  // If already configured successfully, return immediately
  if (googleSignInConfigured) return;

  // If configuration was attempted but failed, throw error to fail fast
  if (googleSignInConfigurationAttempted && !googleSignInAvailable) {
    throw new Error(
      'Google Sign-In is not available. Configuration failed during initialization. ' +
      'Please check that GOOGLE_WEB_CLIENT_ID is set and native modules are available.'
    );
  }

  // Mark that we've attempted configuration
  googleSignInConfigurationAttempted = true;

  // Validate that GOOGLE_WEB_CLIENT_ID is set
  const webClientId = process.env.GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    console.error(
      '[firebaseAuthService] GOOGLE_WEB_CLIENT_ID environment variable is not set. ' +
      'Google Sign-In will be disabled. Set this variable to enable Google authentication.'
    );
    throw new Error(
      'Google Sign-In is not configured. GOOGLE_WEB_CLIENT_ID environment variable is required. ' +
      'Please set it in your .env file or build configuration.'
    );
  }

  try {
    GoogleSignin.configure({
      webClientId,
      // Request offline access to get a refresh token
      offlineAccess: true,
    });
    googleSignInConfigured = true;
    googleSignInAvailable = true;
  } catch (error) {
    // Configuration failed - log error and mark as unavailable
    console.error('[firebaseAuthService] Failed to configure Google Sign-In:', error);
    googleSignInAvailable = false;
    throw new Error(
      `Google Sign-In configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
      'Please check that native modules are properly installed and linked.'
    );
  }
}

/**
 * Map Firebase user to our User type
 */
function mapFirebaseUser(firebaseUser: FirebaseAuthTypes.User): User {
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
 * Firebase Auth Service implementation for React Native
 */
export const firebaseAuthService: AuthService = {
  // ===========================================================================
  // Email/Password Authentication
  // ===========================================================================

  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await auth().signInWithEmailAndPassword(email, password);
    if (!result.user) {
      throw new Error('Sign in failed - no user returned');
    }
    return mapFirebaseUser(result.user);
  },

  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    if (!result.user) {
      throw new Error('Sign up failed - no user returned');
    }

    // Update display name if provided
    if (displayName) {
      await result.user.updateProfile({ displayName });
    }

    return mapFirebaseUser(result.user);
  },

  async resetPassword(email: string): Promise<void> {
    await auth().sendPasswordResetEmail(email);
  },

  // ===========================================================================
  // Google Sign-In (Native)
  // ===========================================================================

  async signInWithGoogle(): Promise<User> {
    try {
      // Ensure Google Sign-In is configured (lazy initialization)
      ensureGoogleSignInConfigured();

      // Check if device supports Google Play Services (Android only, no-op on iOS)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the user's ID token from Google
      const signInResult = await GoogleSignin.signIn();

      // Debug logging for release build issues
      console.log('[firebaseAuthService] signInResult type:', signInResult?.type);

      if (signInResult.type !== 'success') {
        throw new Error('Google Sign-In was cancelled or failed');
      }

      const idToken = signInResult.data.idToken;
      console.log('[firebaseAuthService] idToken present:', !!idToken);

      if (!idToken) {
        throw new Error('Google Sign-In failed - no ID token returned');
      }

      // Create a Firebase credential with the Google ID token
      // Use the directly imported GoogleAuthProvider to prevent tree-shaking issues
      console.log('[firebaseAuthService] GoogleAuthProvider:', typeof GoogleAuthProvider);

      if (!GoogleAuthProvider || typeof GoogleAuthProvider.credential !== 'function') {
        throw new Error(
          'Firebase GoogleAuthProvider is not available. ' +
          'This may be a build configuration issue.'
        );
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      console.log('[firebaseAuthService] googleCredential created:', !!googleCredential);

      // Sign in to Firebase with the Google credential
      const result = await auth().signInWithCredential(googleCredential);
      if (!result.user) {
        throw new Error('Google Sign-In failed - no Firebase user returned');
      }

      return mapFirebaseUser(result.user);
    } catch (error) {
      // Handle account exists with different credential error
      const firebaseError = error as FirebaseAuthTypes.NativeFirebaseAuthError;
      if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        // If the user already has an account with a different provider,
        // they need to sign in with their original method first and then link
        throw new Error(
          'An account already exists with this email using a different sign-in method. ' +
          'Please sign in with your original method first, then link this provider in settings.'
        );
      }
      throw error;
    }
  },

  // ===========================================================================
  // GitHub Sign-In
  // ===========================================================================

  async signInWithGitHub(): Promise<User> {
    // GitHub OAuth for React Native requires react-native-app-auth
    // since signInWithRedirect/signInWithPopup are web-only methods.
    //
    // Prerequisites:
    // 1. Install: yarn workspace @universal/mobile-host add react-native-app-auth
    // 2. Configure GitHub OAuth App in GitHub Developer Settings
    // 3. Add redirect URI to your app's URL scheme (iOS: Info.plist, Android: AndroidManifest.xml)
    //
    // For now, throw an error indicating GitHub Sign-In is not yet implemented
    // on mobile. This follows the implementation plan which notes:
    // "GitHub Sign-In on mobile requires react-native-app-auth (not web redirects)"

    throw new Error(
      'GitHub Sign-In is not yet implemented on mobile. ' +
        'Please use email/password or Google Sign-In for now.'
    );

    // When ready to implement, use the following pattern:
    //
    // import { authorize } from 'react-native-app-auth';
    //
    // const githubAuthConfig = {
    //   issuer: 'https://github.com',
    //   clientId: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
    //   redirectUrl: 'com.mobilehosttmp://oauth/github',
    //   scopes: ['user:email'],
    //   serviceConfiguration: {
    //     authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    //     tokenEndpoint: 'https://github.com/login/oauth/access_token',
    //   },
    // };
    //
    // const authResult = await authorize(githubAuthConfig);
    //
    // if (!authResult.accessToken) {
    //   throw new Error('GitHub OAuth failed - no access token received');
    // }
    //
    // const githubCredential = auth.GithubAuthProvider.credential(authResult.accessToken);
    // const userCredential = await auth().signInWithCredential(githubCredential);
    //
    // if (!userCredential.user) {
    //   throw new Error('GitHub Sign-In failed');
    // }
    //
    // return mapFirebaseUser(userCredential.user);
  },

  // ===========================================================================
  // Session Management
  // ===========================================================================

  async signOut(): Promise<void> {
    // Sign out from Google if signed in via Google
    try {
      // Ensure Google Sign-In is configured before checking sign-in status
      ensureGoogleSignInConfigured();
      const isSignedIn = await GoogleSignin.hasPreviousSignIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
    } catch {
      // Ignore - user might not have signed in with Google
    }

    // Sign out from Firebase
    await auth().signOut();
  },

  getCurrentUser(): User | null {
    const firebaseUser = auth().currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
  },

  async refreshToken(): Promise<string | null> {
    const user = auth().currentUser;
    if (!user) return null;

    // Force refresh the token
    return user.getIdToken(true);
  },

  // ===========================================================================
  // Auth State Listener
  // ===========================================================================

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    try {
      // Subscribe to Firebase auth state changes via auth().onAuthStateChanged
      // Wrap callback in try-catch to prevent silent failures
      const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
        try {
          // Map Firebase user to our User type and invoke callback
          callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
        } catch (callbackError) {
          console.error(
            '[firebaseAuthService] Error in auth state callback while mapping Firebase user:',
            callbackError
          );
          // Attempt to call callback with null as fallback, wrapped in its own try-catch
          // to prevent exceptions from callback(null) from bubbling up and breaking the listener
          try {
            callback(null);
          } catch (fallbackError) {
            console.error(
              '[firebaseAuthService] Error in fallback auth state callback (callback(null)):',
              fallbackError
            );
            // If even callback(null) throws, log but don't propagate to avoid breaking
            // the Firebase listener. The auth state will remain unchanged.
          }
        }
      });

      // Return the unsubscribe function from auth().onAuthStateChanged
      return unsubscribe;
    } catch (error) {
      // If Firebase auth().onAuthStateChanged() fails to initialize, log the error
      // and return a no-op unsubscribe function
      console.error('[firebaseAuthService] Failed to subscribe to auth state changes:', error);

      // Call callback with null immediately to indicate no user
      // Use setTimeout to ensure it's async like the normal Firebase behavior
      setTimeout(() => {
        try {
          callback(null);
        } catch (callbackError) {
          console.error(
            '[firebaseAuthService] Error in fallback auth state callback (initialization failure):',
            callbackError
          );
        }
      }, 0);

      // Return a no-op unsubscribe function since we couldn't set up the listener
      return () => {};
    }
  },
};
