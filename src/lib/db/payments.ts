/**
 * Database helper functions for payments table
 * Task Group 4: Database Functions & Types
 */

import { createNotification } from './notifications'
import { logActivity } from './activityLog'
import { getInvoiceById } from './invoices'
import { supabase } from '@/lib/supabase'
import type {
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  PaymentStatus,
} from './types/invoices'

/**
 * Create a new payment record
 */
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  if (!input.invoice_id || !input.amount || !input.currency) {
    throw new Error('Invoice ID, amount, and currency are required')
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      invoice_id: input.invoice_id,
      amount: input.amount,
      currency: input.currency,
      status: input.status || 'pending',
      stripe_payment_intent_id: input.stripe_payment_intent_id || null,
      stripe_charge_id: input.stripe_charge_id || null,
      paid_at: input.paid_at || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create payment: ${error.message}`)
  }

  const payment = data as Payment

  // Handle side effects if payment is created as succeeded
  if (payment.status === 'succeeded') {
    try {
      const invoice = await getInvoiceById(payment.invoice_id)
      
      if (invoice) {
        // Notification
        await createNotification(
          invoice.client_id,
          'payment_received',
          'Payment Received',
          `Payment of ${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()} received for Invoice ${invoice.invoice_number}`,
          {
            payment_id: payment.id,
            invoice_id: invoice.id,
            project_id: invoice.project_id,
          }
        )

        // Activity Log
        if (invoice.project_id) {
          await logActivity(
            invoice.project_id,
            'payment_received',
            {
              payment_id: payment.id,
              amount: payment.amount,
              currency: payment.currency,
              invoice_number: invoice.invoice_number,
            }
          )
        }
      }
    } catch (e) {
      console.error('Failed to handle payment creation side effects:', e)
    }
  }

  return payment
}

/**
 * Get payment by ID
 */
export async function getPaymentById(id: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get payment: ${error.message}`)
  }

  return data as Payment
}

/**
 * Get all payments for an invoice
 */
export async function getPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get payments: ${error.message}`)
  }

  return data as Payment[]
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  additionalFields?: { stripe_charge_id?: string; paid_at?: string }
): Promise<Payment> {
  const updateData: UpdatePaymentInput = {
    status,
    ...additionalFields,
  }

  const { data } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  const payment = data as Payment

  try {
    const invoice = await getInvoiceById(payment.invoice_id)
    
    if (invoice) {
      if (status === 'succeeded') {
        // Notification
        await createNotification(
          invoice.client_id,
          'payment_received',
          'Payment Received',
          `Payment of ${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()} received for Invoice ${invoice.invoice_number}`,
          {
            payment_id: payment.id,
            invoice_id: invoice.id,
            project_id: invoice.project_id,
          }
        )

        // Activity Log
        if (invoice.project_id) {
          await logActivity(
            invoice.project_id,
            'payment_received',
            {
              payment_id: payment.id,
              amount: payment.amount,
              currency: payment.currency,
              invoice_number: invoice.invoice_number,
            }
          )
        }
      } else if (status === 'failed') {
        // Notification only for failure
        await createNotification(
          invoice.client_id,
          'payment_failed',
          'Payment Failed',
          `Payment for Invoice ${invoice.invoice_number} failed. Please try again.`,
          {
            payment_id: payment.id,
            invoice_id: invoice.id,
            project_id: invoice.project_id,
          }
        )
      }
    }
  } catch (e) {
    console.error('Failed to handle payment update side effects:', e)
  }

  return payment
}

