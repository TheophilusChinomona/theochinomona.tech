/**
 * Payment API utilities
 * Task Group 6: Payment Processing Flow
 */

import { supabase } from '@/lib/supabase'

interface CreateCheckoutSessionParams {
  invoice_id: string
  amount?: number // Optional amount for partial payments (in cents)
  success_url: string
  cancel_url: string
}

interface CreateCheckoutSessionResponse {
  session_id: string
  url: string
}

/**
 * Create a Stripe Checkout session for invoice payment
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CreateCheckoutSessionResponse> {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: params,
  })

  if (error) {
    throw new Error(`Failed to create checkout session: ${error.message}`)
  }

  return data as CreateCheckoutSessionResponse
}

/**
 * Handle payment success redirect
 * This is called after Stripe redirects back to the success URL
 */
export async function handlePaymentSuccess(sessionId: string): Promise<void> {
  // The webhook will handle the actual payment processing
  // This function can be used for client-side confirmation if needed
  console.log('Payment success for session:', sessionId)
}

/**
 * Handle payment cancel redirect
 * This is called after Stripe redirects back to the cancel URL
 */
export async function handlePaymentCancel(): Promise<void> {
  // Client-side handling for cancelled payments
  console.log('Payment cancelled by user')
}

interface CreateSubscriptionParams {
  invoice_id: string
  interval: 'month' | 'year'
}

interface CreateSubscriptionResponse {
  subscription_id: string
  price_id: string
  status: string
  current_period_start: string
  current_period_end: string
  subscription_record?: unknown
}

/**
 * Create a Stripe subscription from an invoice
 * Task Group 6: Payment Processing Flow (Task 6.5)
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResponse> {
  const { data, error } = await supabase.functions.invoke('create-subscription', {
    body: params,
  })

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`)
  }

  return data as CreateSubscriptionResponse
}

