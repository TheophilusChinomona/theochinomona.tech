/**
 * Firebase Realtime Database fallback configuration
 * This file sets up Firebase as a fallback authentication provider
 * Structure is prepared for future implementation
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'
import { getAuth, Auth } from 'firebase/auth'

// Firebase configuration (to be set via environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase app (only if not already initialized)
let firebaseApp: FirebaseApp | null = null
let firebaseDatabase: Database | null = null
let firebaseAuth: Auth | null = null

/**
 * Initialize Firebase app and services
 * Returns null if configuration is incomplete
 */
export function initializeFirebase(): {
  app: FirebaseApp | null
  database: Database | null
  auth: Auth | null
} {
  // Check if Firebase is already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0] ?? null
    if (firebaseApp) {
      firebaseDatabase = getDatabase(firebaseApp)
      firebaseAuth = getAuth(firebaseApp)
    }
    return { app: firebaseApp, database: firebaseDatabase, auth: firebaseAuth }
  }

  // Check if configuration is complete
  const hasConfig =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId

  if (!hasConfig) {
    // Configuration incomplete - return nulls (fallback not ready)
    return { app: null, database: null, auth: null }
  }

  try {
    // Initialize Firebase
    firebaseApp = initializeApp(firebaseConfig)
    firebaseDatabase = getDatabase(firebaseApp)
    firebaseAuth = getAuth(firebaseApp)

    return { app: firebaseApp, database: firebaseDatabase, auth: firebaseAuth }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    return { app: null, database: null, auth: null }
  }
}

/**
 * Get Firebase app instance
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseApp) {
    const { app } = initializeFirebase()
    return app
  }
  return firebaseApp
}

/**
 * Get Firebase Database instance
 */
export function getFirebaseDatabase(): Database | null {
  if (!firebaseDatabase) {
    const { database } = initializeFirebase()
    return database
  }
  return firebaseDatabase
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth(): Auth | null {
  if (!firebaseAuth) {
    const { auth } = initializeFirebase()
    return auth
  }
  return firebaseAuth
}

// Placeholder auth helper functions structure for future implementation
export const firebaseAuthHelpers = {
  signUp: async (
    _email: string,
    _password: string,
    _userData: { name: string; surname: string; phone?: string }
  ) => {
    // TODO: Implement Firebase signup
    throw new Error('Firebase auth not yet implemented')
  },
  signIn: async (_email: string, _password: string) => {
    // TODO: Implement Firebase signin
    throw new Error('Firebase auth not yet implemented')
  },
  signOut: async () => {
    // TODO: Implement Firebase signout
    throw new Error('Firebase auth not yet implemented')
  },
}

