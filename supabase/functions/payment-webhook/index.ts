import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to redact sensitive fields from logs
const redactPayload = (body: any) => {
  if (!body || typeof body !== 'object') return body;
  const redacted = { ...body };
  const sensitiveKeys = ['token', 'signature', 'password', 'cvv', 'card_number', 'credit_card', 'api_key', 'secret'];
  
  for (const key of sensitiveKeys) {
    if (key in redacted) redacted[key] = '[REDACTED]';
  }
  
  // Recursively redact
  for (const key in redacted) {
    if (redacted[key] && typeof redacted[key] === 'object') {
      redacted[redacted] = redactPayload(redacted[key]);
    }
  }
  
  return redacted;
};

/**
 * Validates Kiwify Signature
 */
async function validateKiwifySignature(payload: string, signature: string, secret: string) {
  if (!signature || !secret) return false;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const generatedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return generatedSignature === signature;
}

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  let logId: string | null = null
  let body: any = {}
  let rawBody = ""

  try {
    const url = new URL(req.url)
    const provider = url.searchParams.get('provider') || 'perfectpay'
    
    // 2. Read Body
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      rawBody = await req.text()
      body = JSON.parse(rawBody)
    } else {
      // Fallback for form-data (PerfectPay often uses this)
      const formData = await req.formData()
      const obj: any = {}
      formData.forEach((value, key) => {
        obj[key] = value
      })
      body = obj
      rawBody = JSON.stringify(obj)
    }
    
    console.log(`[Webhook] Received from ${provider}. IP: ${req.headers.get('x-forwarded-for') || 'unknown'}`)

    // 3. Extract common fields
    let externalProductId = ''
    let uniqueEventId = ''
    let saleStatus = ''
    let receivedToken = ''
    let customerEmail = ''
    let customerName = ''

    if (provider === 'perfectpay') {
      externalProductId = String(body.product_id || '')
      uniqueEventId = String(body.sale_id || '')
      saleStatus = String(body.sale_status || '')
      receivedToken = String(body.token || '')
      customerEmail = String(body.customer_email || '').trim().toLowerCase()
      customerName = String(body.customer_name || '')
    } else if (provider === 'kiwify') {
      externalProductId = String(body.product_id || '')
      uniqueEventId = String(body.order_id || body.sale_id || '')
      saleStatus = String(body.order_status || body.status || '')
      receivedToken = req.headers.get('x-kiwify-signature') || url.searchParams.get('signature') || body.signature || ''
      customerEmail = String(body.customer?.email || body.email || '').trim().toLowerCase()
      customerName = String(body.customer?.name || body.name || '')
    }

    // 4. Initial Logging (Audit)
    const { data: log, error: logError } = await supabaseAdmin
      .from('webhook_logs')
      .insert({
        provider,
        payload: redactPayload(body),
        event_type: saleStatus || 'webhook_received',
        email: customerEmail,
        external_product_id: externalProductId,
        order_id: uniqueEventId
      })
      .select()
      .single()

    if (logError) console.error('Error logging webhook:', logError)
    logId = log?.id

    // 5. Hard Validation: Mandatory Fields
    if (!externalProductId || !uniqueEventId || !customerEmail) {
      const msg = `Validation Failed: ${!externalProductId ? 'Missing product_id' : !uniqueEventId ? 'Missing sale_id' : 'Missing email'}`
      await updateLog(logId, 400, msg)
      return new Response(JSON.stringify({ error: msg }), { status: 400, headers: corsHeaders })
    }

    // 6. Security: Token/Signature Check
    if (!receivedToken) {
      const msg = 'Security Error: Missing authentication token/signature'
      await updateLog(logId, 401, msg)
      return new Response(JSON.stringify({ error: msg }), { status: 401, headers: corsHeaders })
    }

    // Fetch integration settings
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('course_integrations')
      .select('*, courses(area_id)')
      .eq('external_product_id', externalProductId)
      .eq('platform', provider)
      .eq('is_enabled', true)
      .maybeSingle()

    if (offerError || !offer) {
      const msg = `Config Error: Offer not found/enabled for product ${externalProductId} on ${provider}`
      await updateLog(logId, 404, msg)
      return new Response(JSON.stringify({ error: 'Product not configured' }), { status: 404, headers: corsHeaders })
    }

    // Provider specific security validation
    let isAuthorized = false
    if (provider === 'perfectpay') {
      isAuthorized = offer.integration_token === receivedToken
    } else if (provider === 'kiwify') {
      // Kiwify uses HMAC-SHA1 of the body
      isAuthorized = await validateKiwifySignature(rawBody, receivedToken, offer.integration_token)
    } else {
      isAuthorized = offer.integration_token === receivedToken
    }

    if (!isAuthorized) {
      const msg = 'Security Error: Invalid authentication token/signature'
      await updateLog(logId, 401, msg)
      return new Response(JSON.stringify({ error: msg }), { status: 401, headers: corsHeaders })
    }

    // 7. Idempotency Check (Prevent Multiple Access)
    const { error: insertProcessError } = await supabaseAdmin
      .from('processed_webhooks')
      .insert({
        unique_event_id: uniqueEventId,
        provider,
        email: customerEmail,
        event_type: saleStatus,
        status: 'processing',
        payload: redactPayload(body)
      })

    if (insertProcessError) {
      if (insertProcessError.code === '23505') { // Unique violation
        console.log(`[Webhook] Duplicate event ${uniqueEventId} detected.`)
        await updateLog(logId, 200, 'Duplicate event ignored.', true)
        return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { status: 200, headers: corsHeaders })
      }
      throw insertProcessError
    }

    // 8. Business Logic: Status Check
    const isApproved = (provider === 'perfectpay' && (saleStatus === 'approved' || saleStatus === 'paid')) || 
                       (provider === 'kiwify' && (saleStatus === 'paid' || saleStatus === 'approved'))

    if (!isApproved) {
      const msg = `Status: ${saleStatus} (Ignored)`
      await updateLog(logId, 200, msg)
      await updateProcess(uniqueEventId, provider, 'completed', msg)
      return new Response(JSON.stringify({ success: true, message: msg }), { status: 200, headers: corsHeaders })
    }

    // 9. Grant Access
    console.log(`[Webhook] Granting access to ${customerEmail} for Course ${offer.course_id}`)
    
    // Find or Create Auth User (Backend logic)
    // We use a safe approach to finding users to avoid leaks
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    let user = users.find(u => u.email?.toLowerCase() === customerEmail)
    let userId = user?.id

    if (!userId) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
        user_metadata: { full_name: customerName, origin: 'webhook_automation' },
        password: Math.random().toString(36).slice(-12) + 'A1!'
      })
      
      if (createError) {
        // Handle race condition where user was created between list and create
        if (createError.message.includes('already registered')) {
          const { data: { users: retryUsers } } = await supabaseAdmin.auth.admin.listUsers()
          userId = retryUsers.find(u => u.email?.toLowerCase() === customerEmail)?.id
        } else {
          throw createError
        }
      } else {
        userId = newUser.user?.id
      }
    }

    if (!userId) throw new Error('Could not resolve User ID')

    // Create Enrollment
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .upsert({
        user_id: userId,
        course_id: offer.course_id,
        area_id: offer.courses?.area_id,
        status: 'active',
        email: customerEmail,
        access_origin: 'webhook',
        granted_at: new Date().toISOString()
      }, { onConflict: 'user_id, course_id' })

    if (enrollError) throw enrollError

    // 10. Finalize
    await updateProcess(uniqueEventId, provider, 'completed')
    await updateLog(logId, 200, 'Success: Access Granted', true)

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    console.error('[Webhook] Critical Error:', error)
    if (logId) await updateLog(logId, 500, error.message)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
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

  async function updateProcess(eventId: string, provider: string, status: string, error?: string) {
    await supabaseAdmin
      .from('processed_webhooks')
      .update({
        status,
        error_message: error,
        processed_at: new Date().toISOString()
      })
      .eq('unique_event_id', eventId)
      .eq('provider', provider)
  }
})
