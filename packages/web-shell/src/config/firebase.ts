/**
 * Firebase Configuration for Web
 *
 * These are public API keys - they are safe to commit.
 * Security is enforced through Firebase Security Rules.
 *
 * Environment variables can be set via:
 * - .env file at project root (for local development)
 * - CI/CD environment variables (for production builds)
 *
 * Note: Rspack uses process.env, not import.meta.env like Vite.
 * The DefinePlugin in rspack.config.mjs handles the replacement.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase configuration from environment variables
// Falls back to hardcoded values for development (these are public API keys)
const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY ||
    'AIzaSyAA2fGYduWsdwXXXDP7KKrIkcaDg3UuS1Q',
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN || 'universal-mfe.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'universal-mfe',
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || 'universal-mfe.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '489294318656',
  appId:
    process.env.FIREBASE_APP_ID ||
    '1:489294318656:web:222b01b55cadc1a0a8a3a5',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-PM1CXVNBED',
};

// Initialize Firebase (only once)
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);

export { app, auth, firebaseConfig };
