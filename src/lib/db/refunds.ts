/**
 * Database helper functions for refunds table
 * Task Group 4: Database Functions & Types
 */

import { supabase } from '@/lib/supabase'
import type {
  Refund,
  CreateRefundInput,
  UpdateRefundInput,
  RefundStatus,
} from './types/invoices'

/**
 * Create a new refund record
 */
export async function createRefund(data: CreateRefundInput): Promise<Refund> {
  if (!data.payment_id || !data.invoice_id || !data.amount) {
    throw new Error('Payment ID, invoice ID, and amount are required')
  }

  const { data: refund, error } = await supabase
    .from('refunds')
    .insert({
      payment_id: data.payment_id,
      invoice_id: data.invoice_id,
      amount: data.amount,
      reason: data.reason || null,
      stripe_refund_id: data.stripe_refund_id || null,
      status: data.status || 'pending',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create refund: ${error.message}`)
  }

  return refund as Refund
}

/**
 * Get refund by ID
 */
export async function getRefundById(id: string): Promise<Refund | null> {
  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get refund: ${error.message}`)
  }

  return data as Refund
}

/**
 * Get all refunds for an invoice
 */
export async function getRefundsForInvoice(invoiceId: string): Promise<Refund[]> {
  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get refunds: ${error.message}`)
  }

  return data as Refund[]
}

/**
 * Update refund status
 */
export async function updateRefundStatus(
  id: string,
  status: RefundStatus,
  additionalFields?: { stripe_refund_id?: string }
): Promise<Refund> {
  const updateData: UpdateRefundInput = {
    status,
    ...additionalFields,
  }

  const { data, error } = await supabase
    .from('refunds')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Refund not found')
    }
    throw new Error(`Failed to update refund: ${error.message}`)
  }

  return data as Refund
}

