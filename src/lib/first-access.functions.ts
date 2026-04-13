import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { getRequestHeader } from '@tanstack/react-start/server';
import { z } from 'zod';

const ADMIN_EMAIL = 'renatonardin13@gmail.com';
const FALLBACK_APP_URL = 'https://pazemcancao.lovable.app';

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing server config');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const emailSchema = z.object({
  email: z.string().email().max(255).trim(),
});

function getAppOrigin() {
  const originHeader = getRequestHeader('origin');
  if (originHeader) {
    return originHeader.replace(/\/$/, '');
  }

  const refererHeader = getRequestHeader('referer');
  if (refererHeader) {
    try {
      return new URL(refererHeader).origin;
    } catch {
      return FALLBACK_APP_URL;
    }
  }

  return FALLBACK_APP_URL;
}

/**
 * First access / password reset flow:
 * 1. Verify the email is an approved buyer
 * 2. Check if user exists in auth — if not, create them
 * 3. Send password reset email
 */
export const requestFirstAccess = createServerFn({ method: 'POST' })
  .inputValidator((input: { email: string }) => emailSchema.parse(input))
  .handler(async ({ data }) => {
    const admin = getAdminClient();
    const email = data.email.toLowerCase().trim();
    const isAdminEmail = email === ADMIN_EMAIL;
    const appOrigin = getAppOrigin();

    // 1. Check approved_buyers
    if (!isAdminEmail) {
      const { data: buyer } = await admin
        .from('approved_buyers')
        .select('email, access_enabled')
        .eq('email', email)
        .maybeSingle();

      if (!buyer || !buyer.access_enabled) {
        return {
          success: true,
          message: 'Se este e-mail estiver vinculado a uma compra aprovada, você receberá um link para definir sua senha.',
        };
      }
    }

    // 2. Check if user already exists in auth
    const { data: userList } = await admin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (!existingUser) {
      // Create user with a random password — they'll set it via reset link
      const tempPassword = crypto.randomUUID() + crypto.randomUUID();
      const { error: createError } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm since they're approved buyers
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return {
          success: false,
          message: 'Erro ao processar sua solicitação. Tente novamente em alguns instantes.',
        };
      }
    }

    if (isAdminEmail) {
      const adminUserId = existingUser?.id ?? userList?.users?.find(
        (u) => u.email?.toLowerCase() === email
      )?.id;

      if (adminUserId) {
        await admin.from('user_roles').upsert(
          { user_id: adminUserId, role: 'admin' },
          { onConflict: 'user_id,role' }
        );
      }
    }

    // 3. Send password reset email
    const publicUrl = process.env.SUPABASE_URL;
    const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (publicUrl && publicKey) {
      const publicClient = createClient(publicUrl, publicKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await publicClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${appOrigin}/login`,
      });
    }

    return {
      success: true,
      message: 'Se este e-mail estiver vinculado a uma compra aprovada, você receberá um link para definir sua senha.',
    };
  });
