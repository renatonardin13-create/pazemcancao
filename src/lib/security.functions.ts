import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { createClient } from '@supabase/supabase-js';
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server';

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing server config');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getAuthenticatedEmail(
  admin: ReturnType<typeof getAdminClient>,
  userId: string,
  claims?: { email?: unknown }
) {
  const claimEmail = typeof claims?.email === 'string' ? claims.email.toLowerCase() : null;
  if (claimEmail) return claimEmail;

  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) return null;

  return data.user?.email?.toLowerCase() ?? null;
}

async function isAdminUser(
  admin: ReturnType<typeof getAdminClient>,
  userId: string
) {
  const { data } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  return !!data;
}

/**
 * Register a login: log access, enforce single session, detect suspicious activity.
 */
export const registerLogin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { deviceFingerprint: string; sessionToken: string }) => input)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const admin = getAdminClient();

    const email = await getAuthenticatedEmail(admin, userId, claims);
    if (!email) {
      return {
        allowed: false,
        reason: 'no-email',
        message: 'Não foi possível validar seu e-mail de acesso. Faça login novamente e tente de novo.',
      };
    }

    const isAdmin = await isAdminUser(admin, userId);

    const userAgent = getRequestHeader('user-agent') || 'unknown';
    const ipAddress = getRequestIP({ xForwardedFor: true }) || 'unknown';
    const { deviceFingerprint, sessionToken } = data;

    if (!isAdmin) {
    // 1. Check if user is blocked
    const { data: recentBlocks } = await admin
      .from('user_access_logs')
      .select('id')
      .eq('email', email)
      .eq('is_blocked', true)
      .gte('login_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(1);

    if (recentBlocks && recentBlocks.length > 0) {
      return {
        allowed: false,
        reason: 'blocked',
        message: 'Acesso não autorizado detectado. Esta conta está vinculada ao comprador original. Se você é o titular da compra, tente novamente no dispositivo autorizado.',
      };
    }

    // 2. Detect suspicious activity: too many logins in short time
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentLogins, error: recentErr } = await admin
      .from('user_access_logs')
      .select('id, device_fingerprint, ip_address')
      .eq('email', email)
      .gte('login_at', fiveMinAgo);

    const recentCount = recentLogins?.length || 0;
    const uniqueDevices = new Set(recentLogins?.map(l => l.device_fingerprint).filter(Boolean));

    // Flag suspicious: 5+ logins in 5 min OR 3+ different devices in 5 min
    const isSuspicious = recentCount >= 5 || uniqueDevices.size >= 3;

    if (isSuspicious) {
      // Log blocked access
      await admin.from('user_access_logs').insert({
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_fingerprint: deviceFingerprint,
        is_blocked: true,
        block_reason: recentCount >= 5
          ? 'too_many_logins'
          : 'multiple_devices',
      });

      return {
        allowed: false,
        reason: 'suspicious',
        message: 'Acesso não autorizado detectado. Esta conta está vinculada ao comprador original. Se você é o titular da compra, tente novamente no dispositivo autorizado.',
      };
    }
    }

    // 3. Invalidate previous sessions for this email
    await admin
      .from('active_sessions')
      .update({ is_valid: false })
      .eq('email', email)
      .eq('is_valid', true);

    // 4. Create new active session
    await admin.from('active_sessions').insert({
      email,
      session_token: sessionToken,
      device_fingerprint: deviceFingerprint,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    // 5. Log access
    await admin.from('user_access_logs').insert({
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_fingerprint: deviceFingerprint,
      is_blocked: false,
    });

    // 5.1. Log to central audit_logs
    await admin.from('audit_logs').insert({
      user_id: userId,
      action: 'USER_LOGIN',
      entity_type: 'auth',
      entity_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { email, deviceFingerprint }
    });

    // 6. Update approved_buyers login timestamps
    const now = new Date().toISOString();
    await admin
      .from('approved_buyers')
      .update({ last_login_at: now })
      .eq('email', email);

    // Set first_login_at if null
    await admin
      .from('approved_buyers')
      .update({ first_login_at: now })
      .eq('email', email)
      .is('first_login_at', null);

    return { allowed: true, reason: null, message: null };
  });

/**
 * Validate that the current session is still active (not invalidated by another login).
 */
export const validateSession = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionToken: string }) => input)
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const admin = getAdminClient();

    const email = await getAuthenticatedEmail(admin, userId, claims);
    if (!email) return { valid: false };

    const { data: session } = await admin
      .from('active_sessions')
      .select('session_token')
      .eq('email', email)
      .eq('is_valid', true)
      .maybeSingle();

    return { valid: session?.session_token === data.sessionToken };
  });
