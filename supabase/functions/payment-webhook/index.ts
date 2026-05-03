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
    const urlProvider = url.searchParams.get('gateway') || url.searchParams.get('provider')
    
    // 1. Read Body
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      rawBody = await req.text()
      body = JSON.parse(rawBody)
    } else {
      const formData = await req.formData()
      const obj: any = {}
      formData.forEach((value, key) => {
        obj[key] = value
      })
      body = obj
      rawBody = JSON.stringify(obj)
    }
    
    // Detect provider if not in URL
    let provider = urlProvider
    if (!provider) {
      if (body.product_id && body.sale_id && body.customer_email) provider = 'perfect_pay'
      if (body.order_id || body.order_status) provider = 'kiwify'
    }
    provider = provider || 'unknown'

    console.log(`[Webhook] Received from ${provider}.`)

    // 2. Extract common fields
    let externalProductCode = ''
    let uniqueEventId = ''
    let saleStatus = ''
    let receivedToken = ''
    let customerEmail = ''
    let customerName = ''

    if (provider === 'perfectpay') {
      externalProductCode = String(body.product_id || '')
      uniqueEventId = String(body.sale_id || '')
      saleStatus = String(body.sale_status || '')
      receivedToken = String(body.token || '')
      customerEmail = String(body.customer_email || '').trim().toLowerCase()
      customerName = String(body.customer_name || '')
    } else if (provider === 'kiwify') {
      externalProductCode = String(body.product?.id || body.product_id || '')
      uniqueEventId = String(body.order_id || body.sale_id || '')
      saleStatus = String(body.order_status || body.status || '')
      receivedToken = req.headers.get('x-kiwify-signature') || ''
      customerEmail = String(body.customer?.email || body.email || '').trim().toLowerCase()
      customerName = String(body.customer?.name || body.name || '')
    }

    // 3. Initial Logging
    const { data: log, error: logError } = await supabaseAdmin
      .from('webhook_logs')
      .insert({
        provider,
        payload: redactPayload(body),
        event_type: saleStatus || 'webhook_received',
        email: customerEmail,
        external_product_id: externalProductCode,
        order_id: uniqueEventId
      })
      .select()
      .single()

    if (logError) console.error('Error logging webhook:', logError)
    logId = log?.id

    // 4. Validation
    if (!externalProductCode || !uniqueEventId || !customerEmail) {
      const msg = `Validation Failed: ${!externalProductCode ? 'Missing product code' : !uniqueEventId ? 'Missing event id' : 'Missing email'}`
      await updateLog(logId, 400, msg)
      return new Response(JSON.stringify({ error: msg }), { status: 400, headers: corsHeaders })
    }

    // 5. Find Offer
    // Search for offer where external_product_code matches (handle multiple codes separated by comma)
    const { data: offers, error: offerError } = await supabaseAdmin
      .from('ofertas')
      .select('*, ofertas_produtos(produto_id, produtos(*))')
      .eq('gateway', provider)
      .eq('status', 'ativa')

    if (offerError) throw offerError

    const offer = offers?.find(o => {
      const codes = o.codigo_externo.split(',').map((c: string) => c.trim())
      return codes.includes(externalProductCode)
    })

    if (!offer) {
      const msg = `Config Error: Active offer not found for product ${externalProductCode} on ${provider}`
      await updateLog(logId, 404, msg)
      return new Response(JSON.stringify({ error: 'Offer not configured' }), { status: 404, headers: corsHeaders })
    }

    // 6. Security Validation
    let isAuthorized = false
    if (provider === 'perfectpay') {
      isAuthorized = offer.token === receivedToken
    } else if (provider === 'kiwify') {
      isAuthorized = await validateKiwifySignature(rawBody, receivedToken, offer.token)
    }

    if (!isAuthorized && offer.token) {
      const msg = 'Security Error: Invalid authentication token/signature'
      await updateLog(logId, 401, msg)
      return new Response(JSON.stringify({ error: msg }), { status: 401, headers: corsHeaders })
    }

    // 7. Idempotency Check
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

    if (insertProcessError && insertProcessError.code === '23505') {
      await updateLog(logId, 200, 'Duplicate event ignored.', true)
      return new Response(JSON.stringify({ success: true, message: 'Already processed' }), { status: 200, headers: corsHeaders })
    }

    // 8. Process Status
    const isApproved = (provider === 'perfectpay' && (saleStatus === 'approved' || saleStatus === 'paid')) || 
                       (provider === 'kiwify' && (saleStatus === 'paid' || saleStatus === 'approved'))
    
    const isRefunded = (provider === 'perfectpay' && (saleStatus === 'refunded' || saleStatus === 'chargeback')) ||
                       (provider === 'kiwify' && (saleStatus === 'refunded' || saleStatus === 'charged_back'))

    if (isApproved) {
      // Grant Access
      const products = offer.ofertas_produtos.map((op: any) => op.produtos)
      
      for (const product of products) {
        // Record in acessos_usuario
        await supabaseAdmin
          .from('acessos_usuario')
          .upsert({
            usuario_email: customerEmail,
            produto_id: product.id,
            origem: provider,
            status: 'ativo'
          }, { onConflict: 'usuario_email, produto_id' })

        // If it's a course, also create enrollment
        if (product.tipo === 'curso') {
          // Find user ID if exists
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
          const user = users.find(u => u.email?.toLowerCase() === customerEmail)
          
          if (user) {
            // Find course linked to this product (might need a link table or naming convention)
            // For now, let's assume the product.nome matches a course name or we have a mapping
            // In a real scenario, we'd have a column `course_id` in `produtos`
          }
        }
      }

      await updateLog(logId, 200, 'Success: Access Granted', true)
    } else if (isRefunded) {
      // Revoke Access
      const products = offer.ofertas_produtos.map((op: any) => op.produtos)
      for (const product of products) {
        await supabaseAdmin
          .from('acessos_usuario')
          .update({ status: 'cancelado' })
          .eq('usuario_email', customerEmail)
          .eq('produto_id', product.id)
      }
      await updateLog(logId, 200, 'Success: Access Revoked', true)
    } else {
      await updateLog(logId, 200, `Status ${saleStatus} ignored`, true)
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('[Webhook] Error:', error)
    if (logId) await updateLog(logId, 500, error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
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
