/**
 * TypeScript interfaces for invoices, payments, refunds, subscriptions, and tax rates
 * Task Group 4: Database Functions & Types
 */

// ============================================================================
// Invoice Types
// ============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'refunded' | 'cancelled'

export interface Invoice {
  id: string
  project_id: string | null
  client_id: string
  invoice_number: string
  status: InvoiceStatus
  subtotal: number // Amount in cents
  discount_amount: number // Amount in cents
  tax_amount: number // Amount in cents
  total: number // Amount in cents
  currency: string
  due_date: string | null
  sent_at: string | null
  paid_at: string | null
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number // Amount in cents
  total: number // Amount in cents
  phase_id: string | null
  task_id: string | null
  created_at: string
}

export interface CreateInvoiceInput {
  project_id?: string | null
  client_id: string
  invoice_number: string
  status?: InvoiceStatus
  subtotal: number
  discount_amount?: number
  tax_amount?: number
  total: number
  currency?: string
  due_date?: string | null
  notes?: string | null
  line_items: CreateInvoiceLineItemInput[]
  is_recurring?: boolean
  recurring_interval?: 'month' | 'year'
}

export interface CreateInvoiceLineItemInput {
  description: string
  quantity?: number
  unit_price: number
  total: number
  phase_id?: string | null
  task_id?: string | null
}

export interface UpdateInvoiceInput {
  project_id?: string | null
  status?: InvoiceStatus
  subtotal?: number
  discount_amount?: number
  tax_amount?: number
  total?: number
  currency?: string
  due_date?: string | null
  sent_at?: string | null
  paid_at?: string | null
  stripe_checkout_session_id?: string | null
  stripe_payment_intent_id?: string | null
  notes?: string | null
}

export interface InvoiceWithLineItems extends Invoice {
  line_items: InvoiceLineItem[]
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded'

export interface Payment {
  id: string
  invoice_id: string
  amount: number // Amount in cents
  currency: string
  status: PaymentStatus
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  paid_at: string | null
  created_at: string
}

export interface CreatePaymentInput {
  invoice_id: string
  amount: number
  currency: string
  status?: PaymentStatus
  stripe_payment_intent_id?: string | null
  stripe_charge_id?: string | null
  paid_at?: string | null
}

export interface UpdatePaymentInput {
  status?: PaymentStatus
  stripe_payment_intent_id?: string | null
  stripe_charge_id?: string | null
  paid_at?: string | null
}

// ============================================================================
// Refund Types
// ============================================================================

export type RefundStatus = 'pending' | 'succeeded' | 'failed'

export interface Refund {
  id: string
  payment_id: string
  invoice_id: string
  amount: number // Amount in cents
  reason: string | null
  stripe_refund_id: string | null
  status: RefundStatus
  created_at: string
}

export interface CreateRefundInput {
  payment_id: string
  invoice_id: string
  amount: number
  reason?: string | null
  stripe_refund_id?: string | null
  status?: RefundStatus
}

export interface UpdateRefundInput {
  status?: RefundStatus
  stripe_refund_id?: string | null
}

// ============================================================================
// Subscription Types
// ============================================================================

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export interface Subscription {
  id: string
  client_id: string
  project_id: string | null
  stripe_subscription_id: string
  stripe_price_id: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionInput {
  client_id: string
  project_id?: string | null
  stripe_subscription_id: string
  stripe_price_id: string
  status?: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  canceled_at?: string | null
}

export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus
  current_period_start?: string
  current_period_end?: string
  canceled_at?: string | null
}

// ============================================================================
// Tax Rate Types
// ============================================================================

export interface TaxRate {
  id: string
  name: string
  rate: number // Percentage, e.g., 8.5 for 8.5%
  country: string | null
  state: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTaxRateInput {
  name: string
  rate: number
  country?: string | null
  state?: string | null
  is_active?: boolean
}

export interface UpdateTaxRateInput {
  name?: string
  rate?: number
  country?: string | null
  state?: string | null
  is_active?: boolean
}

