/**
 * Database helper functions for payments table
 * Task Group 4: Database Functions & Types
 */

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
export async function createPayment(data: CreatePaymentInput): Promise<Payment> {
  if (!data.invoice_id || !data.amount || !data.currency) {
    throw new Error('Invoice ID, amount, and currency are required')
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      invoice_id: data.invoice_id,
      amount: data.amount,
      currency: data.currency,
      status: data.status || 'pending',
      stripe_payment_intent_id: data.stripe_payment_intent_id || null,
      stripe_charge_id: data.stripe_charge_id || null,
      paid_at: data.paid_at || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create payment: ${error.message}`)
  }

  return payment as Payment
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

  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Payment not found')
    }
    throw new Error(`Failed to update payment: ${error.message}`)
  }

  return data as Payment
}

