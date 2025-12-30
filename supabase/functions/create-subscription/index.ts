/**
 * Supabase Edge Function: Create Stripe Subscription
 * Creates a Stripe subscription from an invoice for recurring payments
 * 
 * Requires environment variables:
 * - STRIPE_SECRET_KEY: Stripe secret key
 * - SUPABASE_URL: Supabase project URL (auto-injected)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access (auto-injected)
 * 
 * Task Group 6: Payment Processing Flow (Task 6.5)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import Stripe from "npm:stripe@20.1.0"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

interface CreateSubscriptionRequest {
  invoice_id: string
  interval: 'month' | 'year'
}

Deno.serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Parse request body
    const body: CreateSubscriptionRequest = await req.json()
    const { invoice_id, interval } = body

    // Validate required fields
    if (!invoice_id || !interval) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: invoice_id, interval' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (interval !== 'month' && interval !== 'year') {
      return new Response(
        JSON.stringify({ error: 'Invalid interval. Must be "month" or "year"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, client_id, project_id, total, currency, invoice_number')
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get or create Stripe customer
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('id', invoice.client_id)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let customerId = user.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })

      customerId = customer.id

      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create Stripe Price for the subscription
    const price = await stripe.prices.create({
      currency: invoice.currency,
      unit_amount: invoice.total,
      recurring: {
        interval: interval,
      },
      product_data: {
        name: `Invoice ${invoice.invoice_number} - Recurring Payment`,
        description: `Recurring payment for invoice ${invoice.invoice_number}`,
      },
      metadata: {
        invoice_id: invoice.id,
        user_id: user.id,
      },
    })

    // Create Stripe Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: price.id,
        },
      ],
      metadata: {
        invoice_id: invoice.id,
        user_id: user.id,
        project_id: invoice.project_id || '',
      },
    })

    // Calculate current period dates
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString()
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

    // Create subscription record in database
    const { data: subscriptionRecord, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        client_id: invoice.client_id,
        project_id: invoice.project_id || null,
        stripe_subscription_id: subscription.id,
        stripe_price_id: price.id,
        status: subscription.status === 'active' ? 'active' : 'past_due',
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        canceled_at: null,
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Error creating subscription record:', subscriptionError)
      // Note: Subscription is created in Stripe, but database record failed
      // This should be handled by webhook or manual sync
    }

    return new Response(
      JSON.stringify({
        subscription_id: subscription.id,
        price_id: price.id,
        status: subscription.status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        subscription_record: subscriptionRecord,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in create-subscription:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

