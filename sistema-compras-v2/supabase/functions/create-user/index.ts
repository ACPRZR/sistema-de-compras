
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Verify Caller Permissions
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // Check if requester is Admin or Logistics
        // Note: We use the SERVICE_ROLE key for the permission check query simply because
        // passing the JWT limits us to RLS, and we want to be sure (though RLS should allow reading own profile).
        // Actually, easier: assume RLS on profiles works for "self".
        // Or better, query the profile using the user's ID.

        // Create Admin Client for privileged operations
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: requesterProfile } = await supabaseAdmin
            .from('profiles')
            .select('department, role')
            .eq('id', user.id)
            .single()

        const isAuthorized =
            requesterProfile?.department === 'LOGISTICA' ||
            requesterProfile?.role === 'admin' ||
            user.email === 'alvaro-cpr@outlook.com';

        if (!isAuthorized) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized: insufficient permissions' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Parse Body
        const { email, password, fullName, department, role } = await req.json()

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: 'Email and password are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 3. Create User
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        })

        if (createError) throw createError

        // 4. Update Profile (Department & Role)
        // The trigger 'on_auth_user_created' creates the initial profile row.
        // We update it immediately.
        const newUserId = createData.user.id

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                department: department || null,
                role: role || 'buyer'
            })
            .eq('id', newUserId)

        if (updateError) throw updateError

        return new Response(
            JSON.stringify({ user: createData.user, message: 'User created successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
