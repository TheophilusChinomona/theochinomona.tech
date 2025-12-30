/**
 * Supabase Edge Function: Create Stripe Checkout Session
 * Creates a Stripe Checkout session for invoice payment
 * 
 * Requires environment variables:
 * - STRIPE_SECRET_KEY: Stripe secret key
 * - SUPABASE_URL: Supabase project URL (auto-injected)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access (auto-injected)
 * 
 * Task Group 5: Stripe Setup & Webhook Handler
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

interface CreateCheckoutSessionRequest {
  invoice_id: string
  amount?: number // Optional amount for partial payments (in cents)
  success_url: string
  cancel_url: string
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
    const body: CreateCheckoutSessionRequest = await req.json()
    const { invoice_id, amount, success_url, cancel_url } = body

    // Validate required fields
    if (!invoice_id || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: invoice_id, success_url, cancel_url' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, client_id, project_id, total, currency, invoice_number, status')
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if there's a subscription for this invoice
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_price_id, stripe_subscription_id, status')
      .eq('client_id', invoice.client_id)
      .eq('project_id', invoice.project_id || '')
      .eq('status', 'active')
      .maybeSingle()

    // Validate invoice status
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: `Cannot create checkout session for ${invoice.status} invoice` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Determine payment amount (use provided amount or invoice total)
    const paymentAmount = amount || invoice.total

    if (paymentAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Payment amount must be greater than 0' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    // Create Stripe Checkout session
    // If there's an active subscription, use subscription mode; otherwise use payment mode
    const isSubscription = !!subscription && subscription.status === 'active'
    
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      success_url,
      cancel_url,
      metadata: {
        invoice_id: invoice.id,
        user_id: user.id,
      },
      allow_promotion_codes: true,
    }

    if (isSubscription && subscription.stripe_price_id) {
      // Use subscription mode for recurring payments
      sessionConfig.mode = 'subscription'
      sessionConfig.line_items = [
        {
          price: subscription.stripe_price_id,
          quantity: 1,
        },
      ]
    } else {
      // Use payment mode for one-time payments
      sessionConfig.mode = 'payment'
      sessionConfig.line_items = [
        {
          price_data: {
            currency: invoice.currency,
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
              description: `Payment for invoice ${invoice.invoice_number}`,
            },
            unit_amount: paymentAmount,
          },
          quantity: 1,
        },
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    // Update invoice with checkout session ID
    await supabase
      .from('invoices')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', invoice.id)

    return new Response(
      JSON.stringify({
        session_id: session.id,
        url: session.url,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in create-checkout-session:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

