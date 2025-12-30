/**
 * Supabase client initialization
 * Singleton pattern to prevent multiple clients during HMR
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const trimmedUrl = supabaseUrl.trim()
const trimmedKey = supabaseAnonKey.trim()

// Use a consistent storage key based on project ID
const projectId = trimmedUrl.split('//')[1]?.split('.')[0] || 'local'
const STORAGE_KEY = `sb-${projectId}-auth-token`

// Singleton pattern - store client on window to survive HMR
declare global {
  interface Window {
    __supabaseClient?: SupabaseClient
  }
}

function getSupabaseClient(): SupabaseClient {
  // Return existing client if available (survives HMR)
  if (typeof window !== 'undefined' && window.__supabaseClient) {
    return window.__supabaseClient
  }

  // Create new client
  const client = createClient(trimmedUrl, trimmedKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: STORAGE_KEY,
      flowType: 'pkce',
    },
  })

  // Store on window for HMR persistence
  if (typeof window !== 'undefined') {
    window.__supabaseClient = client
  }

  return client
}

export const supabase = getSupabaseClient()
