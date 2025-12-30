/**
 * Supabase Edge Function: Stripe Webhook Handler
 * Handles Stripe webhook events for payment processing
 * 
 * Requires environment variables:
 * - STRIPE_SECRET_KEY: Stripe secret key
 * - STRIPE_WEBHOOK_SECRET: Stripe webhook signing secret
 * - SUPABASE_URL: Supabase project URL (auto-injected)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access (auto-injected)
 * 
 * Task Group 5: Stripe Setup & Webhook Handler
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import Stripe from "npm:stripe@20.1.0"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing required Stripe environment variables')
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

Deno.serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get the raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      ) as Stripe.Event
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Find invoice by stripe_payment_intent_id
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('id, client_id, total, status')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (invoiceError || !invoice) {
          console.error('Invoice not found for payment intent:', paymentIntent.id)
          // Still return success to Stripe to avoid retries
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoice.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            stripe_payment_intent_id: paymentIntent.id,
            stripe_charge_id: paymentIntent.latest_charge as string | null,
            paid_at: new Date().toISOString(),
          })

        if (paymentError) {
          console.error('Failed to create payment record:', paymentError)
        }

        // Update invoice status
        const paidAmount = paymentIntent.amount
        const invoiceTotal = invoice.total
        const newStatus = paidAmount >= invoiceTotal ? 'paid' : 'partially_paid'

        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
          })
          .eq('id', invoice.id)

        if (updateError) {
          console.error('Failed to update invoice status:', updateError)
        }

        // Create notification for client
        await supabase.from('notifications').insert({
          user_id: invoice.client_id,
          type: 'payment_received',
          title: 'Payment Received',
          message: `Payment of $${(paidAmount / 100).toFixed(2)} has been received for invoice.`,
          metadata: { invoice_id: invoice.id, amount: paidAmount },
        })

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: invoice.client_id,
          event_type: 'payment_received',
          event_data: {
            invoice_id: invoice.id,
            amount: paidAmount,
            currency: paymentIntent.currency,
          },
        })

        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid' && session.metadata?.invoice_id) {
          const invoiceId = session.metadata.invoice_id

          // Get invoice
          const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('id, client_id, total, status')
            .eq('id', invoiceId)
            .single()

          if (invoiceError || !invoice) {
            console.error('Invoice not found for checkout session:', invoiceId)
            break
          }

          // Create payment record if payment intent exists
          if (session.payment_intent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              session.payment_intent as string
            )

            const { error: paymentError } = await supabase
              .from('payments')
              .insert({
                invoice_id: invoice.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: 'succeeded',
                stripe_payment_intent_id: paymentIntent.id,
                stripe_charge_id: paymentIntent.latest_charge as string | null,
                paid_at: new Date().toISOString(),
              })

            if (paymentError) {
              console.error('Failed to create payment record:', paymentError)
            }

            // Update invoice status
            const paidAmount = paymentIntent.amount
            const invoiceTotal = invoice.total
            const newStatus = paidAmount >= invoiceTotal ? 'paid' : 'partially_paid'

            await supabase
              .from('invoices')
              .update({
                status: newStatus,
                paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
                stripe_checkout_session_id: session.id,
              })
              .eq('id', invoice.id)
          }
        }

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        
        // Find payment by charge ID
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('id, invoice_id, amount, status')
          .eq('stripe_charge_id', charge.id)
          .single()

        if (paymentError || !payment) {
          console.error('Payment not found for charge:', charge.id)
          break
        }

        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: charge.refunded ? 'refunded' : 'partially_refunded',
          })
          .eq('id', payment.id)

        // Create refund record
        const refundAmount = charge.amount_refunded
        await supabase.from('refunds').insert({
          payment_id: payment.id,
          invoice_id: payment.invoice_id,
          amount: refundAmount,
          stripe_refund_id: charge.refunds?.data[0]?.id || null,
          status: 'succeeded',
        })

        // Update invoice status
        await supabase
          .from('invoices')
          .update({ status: 'refunded' })
          .eq('id', payment.invoice_id)

        // Get invoice for notification
        const { data: invoice } = await supabase
          .from('invoices')
          .select('client_id')
          .eq('id', payment.invoice_id)
          .single()

        if (invoice) {
          // Create notification
          await supabase.from('notifications').insert({
            user_id: invoice.client_id,
            type: 'refund_processed',
            title: 'Refund Processed',
            message: `Refund of $${(refundAmount / 100).toFixed(2)} has been processed.`,
            metadata: { invoice_id: payment.invoice_id, amount: refundAmount },
          })

          // Log activity
          await supabase.from('activity_log').insert({
            user_id: invoice.client_id,
            event_type: 'refund_processed',
            event_data: {
              invoice_id: payment.invoice_id,
              payment_id: payment.id,
              amount: refundAmount,
            },
          })
        }

        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription record in database
        const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString()
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
        
        let status: 'active' | 'canceled' | 'past_due' = 'active'
        if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
          status = 'canceled'
        } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          status = 'past_due'
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to update subscription:', updateError)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Mark subscription as canceled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to cancel subscription:', updateError)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Handle subscription invoice payments
        if (invoice.subscription) {
          // Find subscription by Stripe subscription ID
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('id, client_id, project_id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single()

          if (!subError && subscription) {
            // Create a new invoice record for this subscription payment
            // Note: This creates a new invoice for each subscription billing cycle
            const invoiceNumber = `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
            
            const { data: newInvoice, error: invoiceError } = await supabase
              .from('invoices')
              .insert({
                client_id: subscription.client_id,
                project_id: subscription.project_id,
                invoice_number: invoiceNumber,
                status: 'paid',
                subtotal: invoice.subtotal,
                discount_amount: invoice.discount || 0,
                tax_amount: invoice.tax || 0,
                total: invoice.amount_paid,
                currency: invoice.currency,
                paid_at: new Date().toISOString(),
                notes: `Recurring payment for subscription ${invoice.subscription}`,
              })
              .select()
              .single()

            if (!invoiceError && newInvoice) {
              // Create payment record
              await supabase.from('payments').insert({
                invoice_id: newInvoice.id,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: 'succeeded',
                stripe_payment_intent_id: invoice.payment_intent as string | null,
                paid_at: new Date().toISOString(),
              })

              // Create notification for client
              await supabase.from('notifications').insert({
                user_id: subscription.client_id,
                type: 'payment_received',
                title: 'Recurring Payment Received',
                message: `Payment of $${(invoice.amount_paid / 100).toFixed(2)} has been received for your subscription.`,
                metadata: { invoice_id: newInvoice.id, subscription_id: subscription.id },
              })
            }
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in stripe-webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

