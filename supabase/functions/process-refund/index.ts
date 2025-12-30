/**
 * Supabase Edge Function: Process Refund
 * Processes refunds via Stripe API
 * 
 * Requires environment variables:
 * - STRIPE_SECRET_KEY: Stripe secret key
 * - SUPABASE_URL: Supabase project URL (auto-injected)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access (auto-injected)
 * 
 * Task Group 8: Admin Refund & Tax Management
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@20.1.0"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

interface ProcessRefundRequest {
  charge_id: string
  amount: number // Amount in cents
  reason?: string
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
    const body: ProcessRefundRequest = await req.json()
    const { charge_id, amount, reason } = body

    // Validate required fields
    if (!charge_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: charge_id, amount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Refund amount must be greater than 0' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Process refund via Stripe
    const refund = await stripe.refunds.create({
      charge: charge_id,
      amount: amount,
      reason: reason ? (reason as Stripe.RefundCreateParams.Reason) : undefined,
    })

    return new Response(
      JSON.stringify({
        refund_id: refund.id,
        amount: refund.amount,
        status: refund.status,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in process-refund:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

