/**
 * Supabase Edge Function: Send Invoice Email
 * Sends invoice email to client with PDF attachment or link
 * 
 * Requires environment variables:
 * - RESEND_API_KEY: API key for Resend email service
 * - SUPABASE_URL: Supabase project URL (auto-injected)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access (auto-injected)
 * 
 * Task Group 7: Admin Invoice Management
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface SendInvoiceEmailRequest {
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
    const body: SendInvoiceEmailRequest = await req.json()
    const { invoice_id } = body

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: invoice_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check for Resend API key
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
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

    // Get project information if applicable
    let projectTitle = null
    if (invoice.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('title')
        .eq('id', invoice.project_id)
        .single()
      projectTitle = project?.title || null
    }

    // Format currency
    const formatCurrency = (cents: number) => {
      return `$${(cents / 100).toFixed(2)}`
    }

    // Build invoice URL and PDF download URL
    const baseUrl = req.headers.get('origin') || 'https://theochinomona.tech'
    const invoiceUrl = `${baseUrl}/dashboard/billing/${invoice.id}`
    const pdfUrl = `${baseUrl}/api/invoices/${invoice.id}/pdf` // PDF download link

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #18181b; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #27272a; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                Invoice ${invoice.invoice_number}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #fafafa; margin: 0 0 16px 0; font-size: 20px;">
                Hello ${client.name},
              </h2>
              
              <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
                Please find your invoice details below. You can view and pay this invoice online.
              </p>

              ${projectTitle ? `
              <div style="background-color: #3f3f46; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #71717a; margin: 0 0 4px 0; font-size: 14px;">Project</p>
                <p style="color: #fafafa; margin: 0; font-weight: 600;">${projectTitle}</p>
              </div>
              ` : ''}
              
              <!-- Invoice Details -->
              <div style="background-color: #3f3f46; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #52525b;">
                      <p style="color: #71717a; margin: 0; font-size: 14px;">Subtotal</p>
                    </td>
                    <td align="right" style="padding: 8px 0; border-bottom: 1px solid #52525b;">
                      <p style="color: #fafafa; margin: 0; font-weight: 600;">${formatCurrency(invoice.subtotal)}</p>
                    </td>
                  </tr>
                  ${invoice.discount_amount > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #52525b;">
                      <p style="color: #71717a; margin: 0; font-size: 14px;">Discount</p>
                    </td>
                    <td align="right" style="padding: 8px 0; border-bottom: 1px solid #52525b;">
                      <p style="color: #ef4444; margin: 0; font-weight: 600;">-${formatCurrency(invoice.discount_amount)}</p>
                    </td>
                  </tr>
                  ` : ''}
                  ${invoice.tax_amount > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #52525b;">
                      <p style="color: #71717a; margin: 0; font-size: 14px;">Tax</p>
                    </td>
                    <td align="right" style="padding: 8px 0; border-bottom: 1px solid #52525b;">
                      <p style="color: #fafafa; margin: 0; font-weight: 600;">${formatCurrency(invoice.tax_amount)}</p>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 12px 0 0 0;">
                      <p style="color: #fafafa; margin: 0; font-size: 18px; font-weight: 700;">Total</p>
                    </td>
                    <td align="right" style="padding: 12px 0 0 0;">
                      <p style="color: #fafafa; margin: 0; font-size: 18px; font-weight: 700;">${formatCurrency(invoice.total)}</p>
                    </td>
                  </tr>
                </table>
              </div>

              ${invoice.due_date ? `
              <div style="background-color: #1e3a8a20; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="color: #60a5fa; margin: 0; font-weight: 600;">
                  Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>
              ` : ''}
              
              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${invoiceUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">
                      View & Pay Invoice
                    </a>
                    <a href="${pdfUrl}" style="display: inline-block; background: #27272a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; border: 1px solid #3f3f46;">
                      Download PDF
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f1f23; padding: 24px; text-align: center; border-top: 1px solid #3f3f46;">
              <p style="color: #71717a; margin: 0; font-size: 14px;">
                Invoice Number: <code style="color: #a1a1aa;">${invoice.invoice_number}</code>
              </p>
              <p style="color: #52525b; margin: 12px 0 0 0; font-size: 12px;">
                If you have any questions about this invoice, please contact us.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Invoices <invoices@theochinomona.tech>',
        to: [client.email],
        subject: `Invoice ${invoice.invoice_number} - ${formatCurrency(invoice.total)}`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to send invoice email:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update invoice status to 'sent' and set sent_at timestamp
    await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', invoice_id)

    // Create notification for client
    await supabase.from('notifications').insert({
      user_id: invoice.client_id,
      type: 'invoice_sent',
      title: 'Invoice Sent',
      message: `Invoice ${invoice.invoice_number} has been sent to you.`,
      metadata: { invoice_id: invoice.id },
    })

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: invoice.client_id,
      event_type: 'invoice_sent',
      event_data: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        total: invoice.total,
      },
    })

    return new Response(
      JSON.stringify({
        message: 'Invoice email sent successfully',
        invoice_id: invoice_id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-invoice-email:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

