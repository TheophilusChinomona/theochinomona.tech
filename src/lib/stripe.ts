/**
 * Stripe client initialization for frontend
 * Task Group 6: Payment Processing Flow
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get Stripe instance (singleton)
 */
export function getStripe(): Promise<Stripe | null> {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not set')
    return Promise.resolve(null)
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

