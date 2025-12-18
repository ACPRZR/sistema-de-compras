
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { token, action, approval_code } = await req.json()

        if (!token) throw new Error('Token is required')

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Find the order first
        const { data: orders, error: searchError } = await supabaseAdmin
            .from('orders')
            .select(`
        *,
        items:order_items(
          *,
          product:products(name, sku)
        ),
        supplier:suppliers(name)
      `)
            .eq('whatsapp_token', token)
            .limit(1)

        if (searchError) throw searchError
        if (!orders || orders.length === 0) throw new Error('Orden no encontrada o token inválido')

        const order = orders[0]

        // Action: GET DETAILS (for the UI summary)
        if (action === 'get-details') {
            return new Response(
                JSON.stringify({ success: true, order }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Action: APPROVE
        if (action === 'approve') {
            if (!approval_code) throw new Error('Código de aprobación requerido')

            // Validate code against profiles with role 'presidente' or 'tesorera'
            const { data: approver, error: approverError } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name, role, job_title')
                .in('role', ['presidente', 'tesorera'])
                .eq('approval_code', approval_code)
                .limit(1)
                .single()

            if (approverError || !approver) {
                throw new Error('Código de aprobación inválido o usuario no autorizado')
            }

            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    approver_id: approver.id
                })
                .eq('id', order.id)

            if (updateError) throw updateError

            return new Response(
                JSON.stringify({ success: true, message: 'Orden aprobada correctamente', approver }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Action: REJECT
        else if (action === 'reject') {
            // Assuming rejection doesn't strictly need a code, or maybe it does? 
            // User didn't specify for reject, but for consistency let's leave it open or require code too?
            // For now, I'll update it to require code for security if desired, or simpler.
            // Let's assume rejection also implies authority, so require code.

            if (!approval_code) throw new Error('Código de aprobación requerido para rechazar')

            const { data: approver, error: approverError } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .in('role', ['presidente', 'tesorera'])
                .eq('approval_code', approval_code)
                .limit(1)
                .single()

            if (approverError || !approver) throw new Error('Código de aprobación inválido')

            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({
                    status: 'rejected',
                    approver_id: approver.id
                })
                .eq('id', order.id)

            if (updateError) throw updateError

            return new Response(
                JSON.stringify({ success: true, message: 'Orden rechazada' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        throw new Error('Acción no válida')


    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
