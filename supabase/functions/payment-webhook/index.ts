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

  let logId: string | null = null

  try {
    const url = new URL(req.url)
    const provider = url.searchParams.get('provider') || 'perfectpay'
    
    let body: any = {}
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType && contentType.includes('application/json')) {
      body = await req.json()
    } else {
      try {
        const formData = await req.formData()
        formData.forEach((value, key) => {
          body[key] = value
        })
      } catch (e) {
        const text = await req.text()
        body = { raw: text }
      }
    }
    
    console.log(`Received webhook from ${provider}:`, body)

    // Extract common fields based on provider
    let externalProductId = ''
    let uniqueEventId = ''
    let saleStatus = ''
    let receivedToken = ''
    let customerEmail = ''
    let customerName = ''

    if (provider === 'perfectpay') {
      externalProductId = body.product_id
      uniqueEventId = body.sale_id
      saleStatus = body.sale_status
      receivedToken = body.token
      customerEmail = body.customer_email
      customerName = body.customer_name
    } else if (provider === 'kiwify') {
      externalProductId = body.product_id
      uniqueEventId = body.order_id || body.sale_id
      saleStatus = body.order_status || body.status
      receivedToken = url.searchParams.get('token') || body.token || body.signature
      customerEmail = body.customer?.email || body.email
      customerName = body.customer?.name || body.name
    }

    // 1. Initial Logging in webhook_logs
    const { data: log, error: logError } = await supabaseAdmin
      .from('webhook_logs')
      .insert({
        provider,
        payload: body,
        event_type: saleStatus || 'webhook_received',
        email: customerEmail,
        external_product_id: externalProductId,
        order_id: uniqueEventId
      })
      .select()
      .single()

    if (logError) console.error('Error logging webhook:', logError)
    logId = log?.id

    // 2. Validate mandatory fields
    if (!externalProductId || !uniqueEventId) {
      const msg = !externalProductId ? 'Missing product_id' : 'Missing unique event ID (sale_id/order_id)'
      await updateLog(logId, 400, msg)
      return new Response(JSON.stringify({ error: msg }), { status: 400 })
    }

    // 3. Duplicate Check: "Pagamento duplicado -> ignorar"
    const { data: existingProcess, error: checkError } = await supabaseAdmin
      .from('processed_webhooks')
      .select('id, status')
      .eq('unique_event_id', uniqueEventId)
      .eq('provider', provider)
      .maybeSingle()

    if (existingProcess && existingProcess.status === 'completed') {
      console.log(`Duplicate event ${uniqueEventId} already processed. Ignoring.`)
      await updateLog(logId, 200, 'Duplicate event already processed. Ignored.', true)
      return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { status: 200 })
    }

    // 4. Identify Offer and Validate Token: "Identificar oferta pelo ID do gateway" & "Validar token"
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('course_integrations')
      .select('*, courses(area_id)')
      .eq('external_product_id', externalProductId)
      .eq('platform', provider)
      .eq('is_enabled', true)
      .maybeSingle()

    if (offerError || !offer) {
      const msg = `Offer not found for product ${externalProductId} on ${provider}`
      console.error(msg)
      await updateLog(logId, 404, msg)
      // "Produto inexistente -> log de erro"
      return new Response(JSON.stringify({ error: 'Product/Offer not found' }), { status: 404 })
    }

    // "Token inválido -> bloquear"
    if (offer.integration_token && offer.integration_token !== receivedToken) {
      const msg = 'Invalid authentication token'
      console.error(msg)
      await updateLog(logId, 401, msg)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // 5. Verify status: "Verificar status do pagamento"
    const isApproved = (provider === 'perfectpay' && saleStatus === 'approved') || 
                       (provider === 'kiwify' && (saleStatus === 'paid' || saleStatus === 'approved'))

    if (!isApproved) {
      const msg = `Payment not approved (Status: ${saleStatus})`
      console.log(msg)
      await updateLog(logId, 200, msg)
      return new Response(JSON.stringify({ success: true, message: msg }), { status: 200 })
    }

    // 6. Action: "Liberar acesso ao produto vinculado"
    console.log(`Processing approval for ${customerEmail} - Product ID: ${offer.course_id}`)
    
    // Find or Create User
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    let user = users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())
    let userId = user?.id

    if (!userId) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
        user_metadata: { full_name: customerName },
        password: Math.random().toString(36).slice(-12)
      })
      
      if (createError) {
        if (createError.message.includes('already registered')) {
          // Double check if user exists (race condition)
          const { data: { users: retryUsers } } = await supabaseAdmin.auth.admin.listUsers()
          userId = retryUsers.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())?.id
        } else {
          throw createError
        }
      } else {
        userId = newUser.user?.id
      }
    }

    if (!userId) throw new Error('Could not create or find user')

    // "Associar usuário ao produto" & "Garantir que ele veja na área de membros"
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .upsert({
        user_id: userId,
        course_id: offer.course_id,
        area_id: offer.courses?.area_id, // Ensure visibility in the specific area
        status: 'active',
        email: customerEmail,
        access_origin: 'webhook',
        granted_at: new Date().toISOString()
      }, { onConflict: 'user_id, course_id' })

    if (enrollError) throw enrollError

    // Mark as processed
    await supabaseAdmin
      .from('processed_webhooks')
      .insert({
        unique_event_id: uniqueEventId,
        provider,
        email: customerEmail,
        event_type: saleStatus,
        status: 'completed',
        payload: body
      })

    await updateLog(logId, 200, 'Access granted successfully', true)

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    if (logId) {
      await updateLog(logId, 500, error.message)
    }
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }

  async function updateLog(id: string | null, status: number, message: string, success: boolean = false) {
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
