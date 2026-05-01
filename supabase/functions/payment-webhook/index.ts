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

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const url = new URL(req.url)
    const provider = url.searchParams.get('provider') || 'perfectpay'
    
    let body: any = {}
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      const formData = await req.formData()
      formData.forEach((value, key) => {
        body[key] = value
      })
    }
    
    console.log(`Received webhook from ${provider}:`, body)

    // 1. Initial Logging
    const { data: logEntry, error: logError } = await supabaseAdmin
      .from('webhook_logs')
      .insert({
        provider,
        payload: body,
        event_type: body.sale_status || body.event || 'webhook_received',
        response_status: 200,
        email: body.customer_email || body.email || body.customer?.email
      })
      .select()
      .single()

    if (logError) console.error('Error logging webhook:', logError)

    // 2. Identify Product and Validate Token
    // We expect external_product_id and a token/password
    let externalProductId = ''
    let receivedToken = ''
    let isApproved = false
    let customerEmail = ''
    let customerName = ''

    if (provider === 'perfectpay') {
      externalProductId = body.product_id
      receivedToken = body.token
      isApproved = body.sale_status === 'approved'
      customerEmail = body.customer_email
      customerName = body.customer_name
    } else if (provider === 'kiwify') {
      externalProductId = body.product_id
      // Kiwify uses signature or other methods, but here we might check a token in query or body
      receivedToken = url.searchParams.get('token') || body.token
      isApproved = body.order_status === 'paid' || body.status === 'paid'
      customerEmail = body.customer?.email || body.email
      customerName = body.customer?.name || body.name
    }

    if (!externalProductId) {
      throw new Error('Missing external_product_id')
    }

    // Find the offer config
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('course_integrations')
      .select('course_id, integration_token, is_enabled')
      .eq('external_product_id', externalProductId)
      .eq('platform', provider)
      .eq('is_enabled', true)
      .maybeSingle()

    if (offerError || !offer) {
      await updateLog(logEntry?.id, 404, `Offer not found for product ${externalProductId} on ${provider}`)
      return new Response(JSON.stringify({ error: 'Offer not found' }), { status: 404 })
    }

    // 3. Security Check: Validate Token
    if (offer.integration_token && offer.integration_token !== receivedToken) {
      await updateLog(logEntry?.id, 401, 'Invalid authentication token')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // 4. Action: Grant Access if Approved
    if (isApproved && customerEmail) {
      console.log(`Processing approval for ${customerEmail} - Course: ${offer.course_id}`)
      
      // Find or Create User
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      let user = users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())
      let userId = user?.id

      if (!userId) {
        console.log('Creating new user...')
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: customerEmail,
          email_confirm: true,
          user_metadata: { full_name: customerName },
          password: Math.random().toString(36).slice(-12) // Random password
        })
        
        if (createError) {
          console.error('Error creating user:', createError)
          // If user already exists but listUsers didn't catch it (race condition?)
          if (createError.message.includes('already registered')) {
            // Try to find again or handle accordingly
          } else {
            throw createError
          }
        }
        userId = newUser.user?.id
      }

      if (userId) {
        // Create Enrollment
        const { error: enrollError } = await supabaseAdmin
          .from('enrollments')
          .upsert({
            user_id: userId,
            course_id: offer.course_id,
            status: 'active',
            email: customerEmail,
            access_origin: 'webhook',
            granted_at: new Date().toISOString()
          }, { onConflict: 'user_id, course_id' })

        if (enrollError) {
          console.error('Error creating enrollment:', enrollError)
          throw enrollError
        }

        await updateLog(logEntry?.id, 200, 'Access granted successfully', true)
      }
    } else {
      await updateLog(logEntry?.id, 200, `Webhook received but not processed (Status: ${body.sale_status || body.status})`)
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }

  async function updateLog(id: string | undefined, status: number, message: string, success: boolean = false) {
    if (!id) return
    await supabaseAdmin
      .from('webhook_logs')
      .update({
        response_status: status,
        response_message: message,
        is_success: success,
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
  }
})
