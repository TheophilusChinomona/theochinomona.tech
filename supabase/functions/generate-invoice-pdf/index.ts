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

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        } 
      }
    )
  }

  try {
    // Parse request body
    const body: GenerateInvoicePDFRequest = await req.json()
    const { invoice_id } = body

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: invoice_id' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
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
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
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
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
      )
    }

    // Format currency
    const formatCurrency = (cents: number) => {
      return `$${(cents / 100).toFixed(2)}`
    }

    // SVG logos embedded
    const logoFull = `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg"><g transform="translate(80, 140)">
      <circle cx="60" cy="60" r="55.2" stroke="#4F46E5" stroke-width="1.5" opacity="0.3" fill="none"/>
      <circle cx="60" cy="30" r="4.8" fill="#4F46E5"/>
      <circle cx="60" cy="48" r="6" fill="#4F46E5"/>
      <circle cx="60" cy="66" r="7.199999999999999" fill="#A5B4FC"/>
      <circle cx="60" cy="84" r="8.4" fill="#6366F1"/>
      <circle cx="36" cy="30" r="4.8" fill="#4F46E5"/>
      <circle cx="84" cy="30" r="4.8" fill="#4F46E5"/>
      <line x1="36" y1="30" x2="84" y2="30" stroke="#4F46E5" stroke-width="2"/>
      <line x1="60" y1="30" x2="60" y2="84" stroke="#4F46E5" stroke-width="2.5"/>
      <circle cx="42" cy="54" r="3.5999999999999996" fill="#818CF8" opacity="0.7"/>
      <circle cx="78" cy="54" r="3.5999999999999996" fill="#818CF8" opacity="0.7"/>
      <circle cx="48" cy="74.4" r="4.2" fill="#A5B4FC" opacity="0.8"/>
      <circle cx="72" cy="74.4" r="4.2" fill="#A5B4FC" opacity="0.8"/>
      <line x1="60" y1="48" x2="42" y2="54" stroke="#818CF8" stroke-width="1.5" opacity="0.5"/>
      <line x1="60" y1="48" x2="78" y2="54" stroke="#818CF8" stroke-width="1.5" opacity="0.5"/>
      <line x1="60" y1="66" x2="48" y2="74.4" stroke="#A5B4FC" stroke-width="1.5" opacity="0.6"/>
      <line x1="60" y1="66" x2="72" y2="74.4" stroke="#A5B4FC" stroke-width="1.5" opacity="0.6"/>
      <path d="M 60 21.599999999999998 L 56.4 26.4 M 60 21.599999999999998 L 63.6 26.4" stroke="#4F46E5" stroke-width="2" stroke-linecap="round"/>
      <text x="21.599999999999998" y="62.400000000000006" fill="#4F46E5" font-size="16" opacity="0.4">&lt;</text>
      <text x="93.60000000000001" y="62.400000000000006" fill="#4F46E5" font-size="16" opacity="0.4">/&gt;</text>
      <path d="M 30 90 Q 60 102 90 90" stroke="#6366F1" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
      <circle cx="60" cy="84" r="13.2" stroke="#A5B4FC" stroke-width="1" opacity="0.3" fill="none"/>
      <circle cx="60" cy="84" r="18" stroke="#A5B4FC" stroke-width="0.5" opacity="0.15" fill="none"/>
    </g><text x="230" y="200" fill="#6366F1" font-family="'Pally Variable', sans-serif" font-size="48" font-weight="500">theochinomona</text><text x="230" y="228" fill="#4F46E5" font-family="'Pally Variable', sans-serif" font-size="20" letter-spacing="2">.tech</text></svg>`

    const logoIcon = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><g transform="translate(120, 120)">
      <circle cx="80" cy="80" r="73.60000000000001" stroke="#4F46E5" stroke-width="1.5" opacity="0.3" fill="none"/>
      <circle cx="80" cy="40" r="6.4" fill="#4F46E5"/>
      <circle cx="80" cy="64" r="8" fill="#4F46E5"/>
      <circle cx="80" cy="88" r="9.6" fill="#A5B4FC"/>
      <circle cx="80" cy="112" r="11.200000000000001" fill="#6366F1"/>
      <circle cx="48" cy="40" r="6.4" fill="#4F46E5"/>
      <circle cx="112" cy="40" r="6.4" fill="#4F46E5"/>
      <line x1="48" y1="40" x2="112" y2="40" stroke="#4F46E5" stroke-width="2"/>
      <line x1="80" y1="40" x2="80" y2="112" stroke="#4F46E5" stroke-width="2.5"/>
      <circle cx="56" cy="72" r="4.8" fill="#818CF8" opacity="0.7"/>
      <circle cx="104" cy="72" r="4.8" fill="#818CF8" opacity="0.7"/>
      <circle cx="64" cy="99.2" r="5.6000000000000005" fill="#A5B4FC" opacity="0.8"/>
      <circle cx="96" cy="99.2" r="5.6000000000000005" fill="#A5B4FC" opacity="0.8"/>
      <line x1="80" y1="64" x2="56" y2="72" stroke="#818CF8" stroke-width="1.5" opacity="0.5"/>
      <line x1="80" y1="64" x2="104" y2="72" stroke="#818CF8" stroke-width="1.5" opacity="0.5"/>
      <line x1="80" y1="88" x2="64" y2="99.2" stroke="#A5B4FC" stroke-width="1.5" opacity="0.6"/>
      <line x1="80" y1="88" x2="96" y2="99.2" stroke="#A5B4FC" stroke-width="1.5" opacity="0.6"/>
      <path d="M 80 28.799999999999997 L 75.19999999999999 35.2 M 80 28.799999999999997 L 84.80000000000001 35.2" stroke="#4F46E5" stroke-width="2" stroke-linecap="round"/>
      <text x="28.799999999999997" y="83.2" fill="#4F46E5" font-size="16" opacity="0.4">&lt;</text>
      <text x="124.80000000000001" y="83.2" fill="#4F46E5" font-size="16" opacity="0.4">/&gt;</text>
      <path d="M 40 120 Q 80 136 120 120" stroke="#6366F1" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
      <circle cx="80" cy="112" r="17.6" stroke="#A5B4FC" stroke-width="1" opacity="0.3" fill="none"/>
      <circle cx="80" cy="112" r="24" stroke="#A5B4FC" stroke-width="0.5" opacity="0.15" fill="none"/>
    </g></svg>`

    // Generate HTML for PDF with refined, compact design
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      margin: 0;
      size: letter;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      padding: 24px;
      line-height: 1.4;
      font-size: 13px;
    }
    .top-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #6366F1;
    }
    .logo-header {
      flex: 0 0 auto;
    }
    .logo-header svg {
      max-width: 200px;
      height: auto;
      display: block;
    }
    .invoice-meta {
      text-align: right;
      flex: 0 0 auto;
    }
    .invoice-meta h1 {
      color: #6366F1;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .invoice-meta .invoice-number {
      color: #475569;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 20px;
      padding: 16px;
      background: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%);
      border-radius: 8px;
      border-left: 4px solid #6366F1;
    }
    .info-section h3 {
      color: #6366F1;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .info-section p {
      color: #0F172A;
      font-size: 13px;
      margin-bottom: 6px;
      line-height: 1.5;
    }
    .info-section strong {
      color: #0F172A;
      font-weight: 600;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #E0E7FF;
      color: #4F46E5;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      background: #FFFFFF;
    }
    th {
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: #FFFFFF;
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
      border: none;
    }
    th.text-right {
      text-align: right;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #E2E8F0;
      color: #0F172A;
      font-size: 13px;
    }
    tbody tr:hover {
      background: #F8FAFC;
    }
    tbody tr:last-child td {
      border-bottom: 2px solid #E2E8F0;
    }
    .text-right { text-align: right; }
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .totals {
      width: 280px;
      background: #F8FAFC;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #E2E8F0;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #475569;
    }
    .totals-row.total {
      border-top: 2px solid #6366F1;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: 700;
      font-size: 18px;
      color: #0F172A;
    }
    .totals-row.total span:last-child {
      color: #6366F1;
    }
    .notes-section {
      margin-top: 20px;
      padding: 14px 16px;
      background: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%);
      border-left: 4px solid #6366F1;
      border-radius: 6px;
    }
    .notes-section h3 {
      color: #6366F1;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .notes-section p {
      color: #0F172A;
      font-size: 13px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
    }
    .footer-icon {
      margin-bottom: 10px;
      display: flex;
      justify-content: center;
    }
    .footer-icon svg {
      width: 50px;
      height: 50px;
      opacity: 0.8;
    }
    .footer p {
      color: #475569;
      font-size: 12px;
      margin: 4px 0;
    }
    .footer p:first-of-type {
      color: #6366F1;
      font-weight: 500;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="top-section">
    <div class="logo-header">
      ${logoFull}
    </div>
    <div class="invoice-meta">
      <h1>INVOICE</h1>
      <div class="invoice-number">${invoice.invoice_number}</div>
    </div>
  </div>

  <div class="invoice-info">
    <div class="info-section">
      <h3>Bill To</h3>
      <p><strong>${client.name} ${client.surname}</strong></p>
      <p>${client.email}</p>
    </div>
    <div class="info-section">
      <h3>Invoice Details</h3>
      <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
      ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ''}
      <p><strong>Status:</strong> <span class="status-badge">${invoice.status.replace('_', ' ')}</span></p>
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

  <div class="totals-wrapper">
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
      ${invoice.discount_amount > 0 ? `
      <div class="totals-row">
        <span>Discount</span>
        <span>-${formatCurrency(invoice.discount_amount)}</span>
      </div>
      ` : ''}
      ${invoice.tax_amount > 0 ? `
      <div class="totals-row">
        <span>Tax</span>
        <span>${formatCurrency(invoice.tax_amount)}</span>
      </div>
      ` : ''}
      <div class="totals-row total">
        <span>Total</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
    </div>
  </div>

  ${invoice.notes ? `
  <div class="notes-section">
    <h3>Notes</h3>
    <p>${invoice.notes}</p>
  </div>
  ` : ''}

  <div class="footer">
    <div class="footer-icon">
      ${logoIcon}
    </div>
    <p>Thank you for your business!</p>
    <p>theochinomona.tech</p>
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
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error in generate-invoice-pdf:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        } 
      }
    )
  }
})

