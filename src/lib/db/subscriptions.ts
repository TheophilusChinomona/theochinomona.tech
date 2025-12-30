/**
 * Database helper functions for subscriptions table
 * Task Group 4: Database Functions & Types
 */

import { supabase } from '@/lib/supabase'
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionStatus,
} from './types/invoices'

/**
 * Create a new subscription
 */
export async function createSubscription(data: CreateSubscriptionInput): Promise<Subscription> {
  if (!data.client_id || !data.stripe_subscription_id || !data.stripe_price_id) {
    throw new Error('Client ID, Stripe subscription ID, and Stripe price ID are required')
  }

  if (!data.current_period_start || !data.current_period_end) {
    throw new Error('Current period start and end dates are required')
  }

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      client_id: data.client_id,
      project_id: data.project_id || null,
      stripe_subscription_id: data.stripe_subscription_id,
      stripe_price_id: data.stripe_price_id,
      status: data.status || 'active',
      current_period_start: data.current_period_start,
      current_period_end: data.current_period_end,
      canceled_at: data.canceled_at || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`)
  }

  return subscription as Subscription
}

/**
 * Get all subscriptions for a client
 */
export async function getSubscriptionsForClient(clientId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get subscriptions: ${error.message}`)
  }

  return data as Subscription[]
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
  additionalFields?: { current_period_start?: string; current_period_end?: string; canceled_at?: string | null }
): Promise<Subscription> {
  const updateData: UpdateSubscriptionInput = {
    status,
    ...additionalFields,
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Subscription not found')
    }
    throw new Error(`Failed to update subscription: ${error.message}`)
  }

  return data as Subscription
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(id: string): Promise<Subscription> {
  return updateSubscriptionStatus(id, 'canceled', {
    canceled_at: new Date().toISOString(),
  })
}

