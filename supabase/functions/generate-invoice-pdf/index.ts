/**
 * Supabase Edge Function: Generate Invoice PDF
 * Generates PDF invoices with brand-consistent styling
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

interface GenerateInvoicePDFRequest {
  invoice_id: string
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
    const body: GenerateInvoicePDFRequest = await req.json()
    const { invoice_id } = body

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: invoice_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get invoice with line items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, line_items:invoice_line_items(*)')
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

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

    // Generate HTML for PDF (we'll use a simple HTML-to-PDF approach)
    // For production, consider using puppeteer or a dedicated PDF library
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
      border-bottom: 3px solid #6366F1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #6366F1;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .invoice-info {
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
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    th {
      background: #F1F5F9;
      color: #475569;
      text-align: left;
      padding: 12px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #E2E8F0;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #E2E8F0;
      color: #0F172A;
    }
    .text-right { text-align: right; }
    .totals {
      margin-top: 20px;
      margin-left: auto;
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E2E8F0;
    }
    .totals-row.total {
      border-top: 2px solid #6366F1;
      border-bottom: none;
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
    <h1>INVOICE</h1>
    <p style="color: #64748B;">Invoice Number: ${invoice.invoice_number}</p>
  </div>

  <div class="invoice-info">
    <div class="info-section">
      <h3>Bill To</h3>
      <p><strong>${client.name} ${client.surname}</strong></p>
      <p>${client.email}</p>
    </div>
    <div class="info-section" style="text-align: right;">
      <h3>Invoice Details</h3>
      <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
      ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ''}
      <p><strong>Status:</strong> ${invoice.status.replace('_', ' ').toUpperCase()}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.line_items.map((item: { description: string; quantity: number; unit_price: number; total: number }) => `
      <tr>
        <td>${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unit_price)}</td>
        <td class="text-right">${formatCurrency(item.total)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>${formatCurrency(invoice.subtotal)}</span>
    </div>
    ${invoice.discount_amount > 0 ? `
    <div class="totals-row">
      <span>Discount:</span>
      <span>-${formatCurrency(invoice.discount_amount)}</span>
    </div>
    ` : ''}
    ${invoice.tax_amount > 0 ? `
    <div class="totals-row">
      <span>Tax:</span>
      <span>${formatCurrency(invoice.tax_amount)}</span>
    </div>
    ` : ''}
    <div class="totals-row total">
      <span>Total:</span>
      <span>${formatCurrency(invoice.total)}</span>
    </div>
  </div>

  ${invoice.notes ? `
  <div style="margin-top: 30px; padding: 15px; background: #F8FAFC; border-left: 4px solid #6366F1; border-radius: 4px;">
    <h3 style="color: #475569; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Notes</h3>
    <p style="color: #0F172A;">${invoice.notes}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p style="margin-top: 8px;">theochinomona.tech</p>
  </div>
</body>
</html>
    `.trim()

    // For now, return HTML (can be converted to PDF using a service or library)
    // In production, use puppeteer or similar to generate actual PDF
    return new Response(
      JSON.stringify({
        pdf: htmlContent, // In production, this would be actual PDF bytes
        format: 'html', // Indicates HTML format (can be converted to PDF client-side or via service)
        invoice_id: invoice_id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error in generate-invoice-pdf:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

