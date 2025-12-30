import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteUserRequest {
  email: string
  name: string
  surname: string
  role: 'admin' | 'client'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the caller is authenticated and is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's token to verify their identity
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is authenticated
    const { data: { user }, error: userError } = await userClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: userData, error: roleError } = await userClient
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (roleError || userData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Only admins can invite users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: InviteUserRequest = await req.json()
    const { email, name, surname, role } = body

    if (!email || !name || !surname || !role) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: email, name, surname, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    if (role !== 'admin' && role !== 'client') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid role. Must be "admin" or "client"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user already exists
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'A user with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the site URL for redirect
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173'

    // Invite the user using Supabase Admin API
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/set-password?invited=true`,
      data: {
        name,
        surname,
        role,
      }
    })

    if (inviteError) {
      console.error('Invite error:', inviteError)
      return new Response(
        JSON.stringify({ success: false, error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the user record in our users table
    if (inviteData?.user) {
      const { error: createUserError } = await adminClient
        .from('users')
        .insert({
          auth_user_id: inviteData.user.id,
          email,
          name,
          surname,
          role,
        })

      if (createUserError) {
        console.error('Error creating user record:', createUserError)
        // Don't fail the whole operation, user can still sign up
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}. They will receive an email to set their password.`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in invite-user function:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

