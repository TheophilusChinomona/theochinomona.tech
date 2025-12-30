/**
 * Supabase client initialization
 * This file exports the Supabase client instance for use throughout the application
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('Supabase Config Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'missing',
  })
}

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = []
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')
  
  throw new Error(
    `Missing Supabase environment variables: ${missing.join(', ')}. ` +
    'Please check your .env file and restart your dev server.'
  )
}

// Trim whitespace (common issue with .env files)
const trimmedUrl = supabaseUrl.trim()
const trimmedKey = supabaseAnonKey.trim()

if (!trimmedUrl || !trimmedKey) {
  throw new Error(
    'Supabase environment variables are empty after trimming. ' +
    'Please check your .env file for whitespace issues.'
  )
}

export const supabase = createClient(trimmedUrl, trimmedKey, {
  auth: {
    persistSession: true, // Persist sessions to localStorage
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

