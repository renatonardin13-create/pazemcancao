import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

    // 1. Check approved_buyers
    const { data: buyer } = await admin
      .from('approved_buyers')
      .select('email, access_enabled')
      .eq('email', email)
      .maybeSingle();

    if (!buyer || !buyer.access_enabled) {
      // Don't reveal if email exists — generic message
      return {
        success: true,
        message: 'Se este e-mail estiver vinculado a uma compra aprovada, você receberá um link para definir sua senha.',
      };
    }

    // 2. Check if user already exists in auth
    const { data: existingUsers } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    // Search by email
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

    // 3. Send password reset email
    const siteUrl = process.env.SUPABASE_URL?.replace('.supabase.co', '');
    const { error: resetError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    // Use the public client reset method which sends the email
    const publicUrl = process.env.SUPABASE_URL;
    const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (publicUrl && publicKey) {
      const publicClient = createClient(publicUrl, publicKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await publicClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${publicUrl.replace('.supabase.co', '')}/login`,
      });
    }

    return {
      success: true,
      message: 'Se este e-mail estiver vinculado a uma compra aprovada, você receberá um link para definir sua senha.',
    };
  });
