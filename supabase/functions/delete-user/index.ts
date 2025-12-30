import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userId: string
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

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user is authenticated
    const { data: { user }, error: userError } = await adminClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if caller is admin
    const { data: callerData, error: roleError } = await adminClient
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (roleError || callerData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Only admins can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: DeleteUserRequest = await req.json()
    const { userId } = body

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user record to find auth_user_id
    const { data: userToDelete, error: fetchError } = await adminClient
      .from('users')
      .select('id, auth_user_id, email')
      .eq('id', userId)
      .single()

    if (fetchError || !userToDelete) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prevent self-deletion
    if (userToDelete.auth_user_id === user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'You cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete from auth.users first (this will cascade to public.users due to FK)
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
      userToDelete.auth_user_id
    )

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      // If auth deletion fails, try to delete just from users table
      const { error: usersDeleteError } = await adminClient
        .from('users')
        .delete()
        .eq('id', userId)

      if (usersDeleteError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to delete user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${userToDelete.email} has been deleted`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

