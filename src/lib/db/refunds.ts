/**
 * Database helper functions for refunds table
 * Task Group 4: Database Functions & Types
 */

import { createNotification } from './notifications'
import { logActivity } from './activityLog'
import { getInvoiceById } from './invoices'
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
export async function createRefund(input: CreateRefundInput): Promise<Refund> {
  if (!input.payment_id || !input.invoice_id || !input.amount) {
    throw new Error('Payment ID, invoice ID, and amount are required')
  }

  const { data, error } = await supabase
    .from('refunds')
    .insert({
      payment_id: input.payment_id,
      invoice_id: input.invoice_id,
      amount: input.amount,
      reason: input.reason || null,
      stripe_refund_id: input.stripe_refund_id || null,
      status: input.status || 'pending',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create refund: ${error.message}`)
  }

  const refund = data as Refund

  // Handle side effects if refund is created as succeeded
  if (refund.status === 'succeeded') {
    try {
      const invoice = await getInvoiceById(refund.invoice_id)
      
      if (invoice) {
        // Notification
        await createNotification(
          invoice.client_id,
          'refund_processed',
          'Refund Processed',
          `Refund of ${(refund.amount / 100).toFixed(2)} USD processed for Invoice ${invoice.invoice_number}`,
          {
            refund_id: refund.id,
            invoice_id: invoice.id,
            project_id: invoice.project_id,
          }
        )

        // Activity Log
        if (invoice.project_id) {
          await logActivity(
            invoice.project_id,
            'refund_processed',
            {
              refund_id: refund.id,
              amount: refund.amount,
              invoice_number: invoice.invoice_number,
            }
          )
        }
      }
    } catch (e) {
      console.error('Failed to handle refund creation side effects:', e)
    }
  }

  return refund
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

  const { data } = await supabase
    .from('refunds')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  const refund = data as Refund

  if (status === 'succeeded') {
    try {
      const invoice = await getInvoiceById(refund.invoice_id)
      
      if (invoice) {
        // Notification
        await createNotification(
          invoice.client_id,
          'refund_processed',
          'Refund Processed',
          `Refund of ${(refund.amount / 100).toFixed(2)} USD processed for Invoice ${invoice.invoice_number}`,
          {
            refund_id: refund.id,
            invoice_id: invoice.id,
            project_id: invoice.project_id,
          }
        )

        // Activity Log
        if (invoice.project_id) {
          await logActivity(
            invoice.project_id,
            'refund_processed',
            {
              refund_id: refund.id,
              amount: refund.amount,
              invoice_number: invoice.invoice_number,
            }
          )
        }
      }
    } catch (e) {
      console.error('Failed to handle refund update side effects:', e)
    }
  }

  return refund
}

