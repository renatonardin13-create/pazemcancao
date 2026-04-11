import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';

const trialSchema = z.object({
  email: z.string().email().max(255).trim(),
  nome: z.string().min(1).max(255).trim(),
  trialDays: z.number().min(1).max(90),
});

export const createTrialUser = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; nome: string; trialDays: number }) =>
    trialSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const { data: userData } = await supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

    if (!adminRole && !isAdminEmail) {
      throw new Error('Acesso não autorizado');
    }

    const email = data.email.toLowerCase().trim();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.trialDays);

    // Check if buyer already exists
    const { data: existing } = await supabaseAdmin
      .from('approved_buyers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      // Update existing to trial
      const { error } = await supabaseAdmin
        .from('approved_buyers')
        .update({
          is_trial: true,
          trial_expires_at: expiresAt.toISOString(),
          can_download: false,
          access_enabled: true,
          nome: data.nome,
        })
        .eq('id', existing.id);

      if (error) throw new Error(error.message);
    } else {
      // Create new trial buyer
      const { error } = await supabaseAdmin
        .from('approved_buyers')
        .insert({
          email,
          nome: data.nome,
          is_trial: true,
          trial_expires_at: expiresAt.toISOString(),
          can_download: false,
          access_enabled: true,
          status: 'trial',
          product_name: 'Teste',
        });

      if (error) throw new Error(error.message);
    }

    // Create auth user if doesn't exist
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (!existingUser) {
      const tempPassword = crypto.randomUUID() + crypto.randomUUID();
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });
    }

    // Send password reset so user can set their password
    const publicUrl = process.env.SUPABASE_URL;
    const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (publicUrl && publicKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const publicClient = createClient(publicUrl, publicKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await publicClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${publicUrl.replace('.supabase.co', '')}/login`,
      });
    }

    return { success: true, expiresAt: expiresAt.toISOString() };
  });

export const deleteBuyer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { buyerId: string }) => {
    z.object({ buyerId: z.string().uuid() }).parse(input);
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const { data: userData } = await supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

    if (!adminRole && !isAdminEmail) {
      throw new Error('Acesso não autorizado');
    }

    const { error } = await supabaseAdmin
      .from('approved_buyers')
      .delete()
      .eq('id', data.buyerId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

const updateBuyerSchema = z.object({
  buyerId: z.string().uuid(),
  nome: z.string().min(1).max(255).trim().optional(),
  access_enabled: z.boolean().optional(),
  is_trial: z.boolean().optional(),
  trialDays: z.number().min(1).max(90).optional(),
  can_download: z.boolean().optional(),
});

export const updateBuyer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { buyerId: string; nome?: string; access_enabled?: boolean; is_trial?: boolean; trialDays?: number; can_download?: boolean }) =>
    updateBuyerSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const { data: userData } = await supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

    if (!adminRole && !isAdminEmail) {
      throw new Error('Acesso não autorizado');
    }

    const updates: {
      nome?: string;
      access_enabled?: boolean;
      is_trial?: boolean;
      can_download?: boolean;
      trial_expires_at?: string;
    } = {};
    if (data.nome !== undefined) updates.nome = data.nome;
    if (data.access_enabled !== undefined) updates.access_enabled = data.access_enabled;
    if (data.is_trial !== undefined) updates.is_trial = data.is_trial;
    if (data.can_download !== undefined) updates.can_download = data.can_download;

    if (data.trialDays !== undefined) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.trialDays);
      updates.trial_expires_at = expiresAt.toISOString();
      updates.is_trial = true;
      updates.can_download = false;
      updates.access_enabled = true;
    }

    const { error } = await supabaseAdmin
      .from('approved_buyers')
      .update(updates)
      .eq('id', data.buyerId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const toggleBuyerAccess = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { buyerId: string; access_enabled: boolean }) =>
    z.object({ buyerId: z.string().uuid(), access_enabled: z.boolean() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const { data: userData } = await supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

    if (!adminRole && !isAdminEmail) {
      throw new Error('Acesso não autorizado');
    }

    const { error } = await supabaseAdmin
      .from('approved_buyers')
      .update({ access_enabled: data.access_enabled })
      .eq('id', data.buyerId);

    if (error) throw new Error(error.message);
    return { success: true, access_enabled: data.access_enabled };
  });
