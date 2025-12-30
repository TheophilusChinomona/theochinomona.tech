/**
 * Supabase Edge Function: Generate Receipt PDF
 * Generates PDF receipts for payments
 * 
 * Requires environment variables:
 * - SUPABASE_URL: Supabase project URL (auto-injected)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access (auto-injected)
 * 
 * Task Group 10: PDF Generation & Email Delivery
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface GenerateReceiptPDFRequest {
  payment_id: string
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
    const body: GenerateReceiptPDFRequest = await req.json()
    const { payment_id } = body

    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: payment_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get payment with invoice
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, invoice:invoices(*)')
      .eq('id', payment_id)
      .single()

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const invoice = payment.invoice as any

    // Get client information
    const { data: client, error: clientError } = await supabase
      .from('users')
      .select('id, name, surname, email')
      .eq('id', invoice.client_id)
      .single()

    if (clientError || !client) {
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Format currency
    const formatCurrency = (cents: number) => {
      return `$${(cents / 100).toFixed(2)}`
    }

    // Generate receipt number
    const receiptNumber = `RCP-${payment.id.slice(0, 8).toUpperCase()}`

    // Generate HTML for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #22C55E;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #22C55E;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .receipt-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-section {
      flex: 1;
    }
    .info-section h3 {
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .info-section p {
      color: #0F172A;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .payment-details {
      background: #F0FDF4;
      border-left: 4px solid #22C55E;
      padding: 20px;
      border-radius: 4px;
      margin: 30px 0;
    }
    .payment-details h3 {
      color: #15803D;
      font-size: 16px;
      margin-bottom: 12px;
    }
    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #BBF7D0;
    }
    .payment-row:last-child {
      border-bottom: none;
      border-top: 2px solid #22C55E;
      padding-top: 12px;
      margin-top: 8px;
      font-weight: 700;
      font-size: 18px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E2E8F0;
      color: #64748B;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PAYMENT RECEIPT</h1>
    <p style="color: #64748B;">Receipt Number: ${receiptNumber}</p>
  </div>

  <div class="receipt-info">
    <div class="info-section">
      <h3>Paid By</h3>
      <p><strong>${client.name} ${client.surname}</strong></p>
      <p>${client.email}</p>
    </div>
    <div class="info-section" style="text-align: right;">
      <h3>Payment Details</h3>
      <p><strong>Date:</strong> ${payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : new Date(payment.created_at).toLocaleDateString()}</p>
      <p><strong>Invoice:</strong> ${invoice.invoice_number}</p>
      <p><strong>Status:</strong> ${payment.status.toUpperCase()}</p>
    </div>
  </div>

  <div class="payment-details">
    <h3>Payment Information</h3>
    <div class="payment-row">
      <span>Payment Amount:</span>
      <span>${formatCurrency(payment.amount)}</span>
    </div>
    <div class="payment-row">
      <span>Currency:</span>
      <span>${payment.currency.toUpperCase()}</span>
    </div>
    ${payment.stripe_payment_intent_id ? `
    <div class="payment-row">
      <span>Transaction ID:</span>
      <span style="font-family: monospace; font-size: 11px;">${payment.stripe_payment_intent_id}</span>
    </div>
    ` : ''}
    <div class="payment-row">
      <span>Total Paid:</span>
      <span>${formatCurrency(payment.amount)}</span>
    </div>
  </div>

  <div class="footer">
    <p>This is a confirmation of your payment.</p>
    <p style="margin-top: 8px;">theochinomona.tech</p>
  </div>
</body>
</html>
    `.trim()

    return new Response(
      JSON.stringify({
        pdf: htmlContent,
        format: 'html',
        payment_id: payment_id,
        receipt_number: receiptNumber,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error in generate-receipt-pdf:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

