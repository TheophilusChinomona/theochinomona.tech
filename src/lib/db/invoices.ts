/**
 * Database helper functions for invoices and invoice_line_items tables
 * Task Group 4: Database Functions & Types
 */

import { supabase } from '@/lib/supabase'
import type {
  Invoice,
  InvoiceLineItem,
  InvoiceWithLineItems,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceStatus,
} from './types/invoices'

/**
 * Create a new invoice with line items
 */
export async function createInvoice(data: CreateInvoiceInput): Promise<InvoiceWithLineItems> {
  // Validate required fields
  if (!data.client_id || !data.invoice_number) {
    throw new Error('Client ID and invoice number are required')
  }

  if (!data.line_items || data.line_items.length === 0) {
    throw new Error('At least one line item is required')
  }

  // Calculate totals if not provided
  const subtotal = data.subtotal ?? data.line_items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = data.discount_amount ?? 0
  const taxAmount = data.tax_amount ?? 0
  const total = data.total ?? subtotal - discountAmount + taxAmount

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      project_id: data.project_id || null,
      client_id: data.client_id,
      invoice_number: data.invoice_number,
      status: data.status || 'draft',
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total,
      currency: data.currency || 'usd',
      due_date: data.due_date || null,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (invoiceError) {
    throw new Error(`Failed to create invoice: ${invoiceError.message}`)
  }

  // Create line items
  const lineItemsData = data.line_items.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity ?? 1,
    unit_price: item.unit_price,
    total: item.total,
    phase_id: item.phase_id || null,
    task_id: item.task_id || null,
  }))

  const { data: lineItems, error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .insert(lineItemsData)
    .select()

  if (lineItemsError) {
    // Rollback: delete the invoice if line items fail
    await supabase.from('invoices').delete().eq('id', invoice.id)
    throw new Error(`Failed to create line items: ${lineItemsError.message}`)
  }

  return {
    ...invoice,
    line_items: lineItems as InvoiceLineItem[],
  } as InvoiceWithLineItems
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get invoice: ${error.message}`)
  }

  return data as Invoice
}

/**
 * Get invoice with line items by ID
 */
export async function getInvoiceWithLineItems(id: string): Promise<InvoiceWithLineItems | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, line_items:invoice_line_items(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get invoice: ${error.message}`)
  }

  return data as InvoiceWithLineItems
}

/**
 * Get all invoices for a specific client
 */
export async function getInvoicesForClient(clientId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get invoices: ${error.message}`)
  }

  return data as Invoice[]
}

/**
 * Get all invoices (admin only)
 */
export async function getAllInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get invoices: ${error.message}`)
  }

  return data as Invoice[]
}

/**
 * Update an invoice
 */
export async function updateInvoice(
  id: string,
  updates: UpdateInvoiceInput
): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Invoice not found')
    }
    throw new Error(`Failed to update invoice: ${error.message}`)
  }

  return data as Invoice
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
  additionalFields?: { sent_at?: string; paid_at?: string }
): Promise<Invoice> {
  const updateData: UpdateInvoiceInput = {
    status,
    ...additionalFields,
  }

  return updateInvoice(id, updateData)
}

/**
 * Delete an invoice (and its line items via CASCADE)
 */
export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase.from('invoices').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete invoice: ${error.message}`)
  }
}

/**
 * Calculate invoice totals from line items
 */
export function calculateInvoiceTotal(
  lineItems: { total: number }[],
  discountAmount: number = 0,
  taxRate?: number
): { subtotal: number; discount_amount: number; tax_amount: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const discount = discountAmount
  const subtotalAfterDiscount = subtotal - discount
  const taxAmount = taxRate ? Math.round(subtotalAfterDiscount * (taxRate / 100)) : 0
  const total = subtotalAfterDiscount + taxAmount

  return {
    subtotal,
    discount_amount: discount,
    tax_amount: taxAmount,
    total,
  }
}

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXX where XXXX is a random 4-digit number
 */
export async function generateInvoiceNumber(): Promise<string> {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000) // 4-digit random number
  
  const baseNumber = `INV-${year}${month}${day}-${random}`
  
  // Check if invoice number already exists
  const { data, error } = await supabase
    .from('invoices')
    .select('id')
    .eq('invoice_number', baseNumber)
    .maybeSingle()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check invoice number: ${error.message}`)
  }
  
  // If exists, try again with different random number
  if (data) {
    return generateInvoiceNumber()
  }
  
  return baseNumber
}

