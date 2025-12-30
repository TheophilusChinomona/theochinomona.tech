/**
 * Supabase Edge Function: Send Phase Notification
 * Sends email notifications to opted-in clients when a phase is completed
 * 
 * Requires environment variables:
 * - RESEND_API_KEY: API key for Resend email service
 * - SUPABASE_URL: Supabase project URL (auto-injected)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access (auto-injected)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface NotificationPayload {
  projectId: string
  phaseId: string
  phaseName: string
  trackingCode: string
}

interface EmailRecipient {
  email: string
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
    const payload: NotificationPayload = await req.json()
    const { projectId, phaseId, phaseName, trackingCode } = payload

    // Validate required fields
    if (!projectId || !phaseId || !phaseName || !trackingCode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: projectId, phaseId, phaseName, trackingCode' }),
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

    // Initialize Supabase client with service role for database access
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, notifications_enabled')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('Project not found:', projectError)
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if project notifications are enabled
    if (!project.notifications_enabled) {
      return new Response(
        JSON.stringify({ message: 'Notifications disabled for this project', emailsSent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get tracking code ID
    const { data: trackingCodeRecord, error: trackingError } = await supabase
      .from('tracking_codes')
      .select('id')
      .eq('code', trackingCode)
      .eq('is_active', true)
      .single()

    if (trackingError || !trackingCodeRecord) {
      console.error('Tracking code not found:', trackingError)
      return new Response(
        JSON.stringify({ error: 'Tracking code not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get opted-in email recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('client_notification_preferences')
      .select('email')
      .eq('tracking_code_id', trackingCodeRecord.id)
      .eq('opted_in', true)

    if (recipientsError) {
      console.error('Error fetching recipients:', recipientsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch notification recipients' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No opted-in recipients', emailsSent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get remaining phases info for email content
    const { data: phases, error: phasesError } = await supabase
      .from('project_phases')
      .select('id, name, status')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    const remainingPhases = phases?.filter(p => p.status !== 'completed') || []
    const completedPhases = phases?.filter(p => p.status === 'completed') || []
    const totalPhases = phases?.length || 0

    // Build tracking URL
    const trackingUrl = `${req.headers.get('origin') || 'https://theochinomona.tech'}/track/${trackingCode}`

    // Send emails via Resend
    const emailPromises = recipients.map(async (recipient: EmailRecipient) => {
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
                Phase Completed! 🎉
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #fafafa; margin: 0 0 16px 0; font-size: 20px;">
                ${project.title}
              </h2>
              
              <div style="background-color: #22c55e20; border-left: 4px solid #22c55e; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="color: #4ade80; margin: 0; font-weight: 600;">
                  ✓ "${phaseName}" has been completed
                </p>
              </div>
              
              <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
                We're excited to let you know that a new phase of your project has been completed.
                ${remainingPhases.length > 0 
                  ? `There ${remainingPhases.length === 1 ? 'is' : 'are'} ${remainingPhases.length} phase${remainingPhases.length === 1 ? '' : 's'} remaining.`
                  : 'All phases have been completed!'}
              </p>
              
              <!-- Progress -->
              <div style="margin-bottom: 24px;">
                <p style="color: #71717a; margin: 0 0 8px 0; font-size: 14px;">
                  Progress: ${completedPhases.length} of ${totalPhases} phases complete
                </p>
                <div style="background-color: #3f3f46; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #4f46e5, #7c3aed); height: 100%; width: ${Math.round((completedPhases.length / totalPhases) * 100)}%;"></div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View Project Progress
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
                Tracking Code: <code style="color: #a1a1aa;">${trackingCode}</code>
              </p>
              <p style="color: #52525b; margin: 12px 0 0 0; font-size: 12px;">
                You received this email because you opted in to project notifications.
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

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Project Updates <notifications@theochinomona.tech>',
          to: [recipient.email],
          subject: `Phase Completed: ${phaseName} - ${project.title}`,
          html: emailHtml,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to send email to ${recipient.email}:`, errorText)
        return { email: recipient.email, success: false, error: errorText }
      }

      return { email: recipient.email, success: true }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        message: `Emails sent: ${successCount} successful, ${failedCount} failed`,
        emailsSent: successCount,
        emailsFailed: failedCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-phase-notification:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

