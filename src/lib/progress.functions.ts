import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const trackContentView = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { contentId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();
    if (!email) return { ok: false };

    await supabaseAdmin
      .from('user_content_progress' as any)
      .upsert(
        {
          user_email: email,
          content_id: data.contentId,
          viewed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
        },
        { onConflict: 'user_email,content_id' }
      );

    return { ok: true };
  });

export const trackContentComplete = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { contentId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();
    if (!email) return { ok: false };

    await supabaseAdmin
      .from('user_content_progress' as any)
      .upsert(
        {
          user_email: email,
          content_id: data.contentId,
          completed_at: new Date().toISOString(),
          viewed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
        },
        { onConflict: 'user_email,content_id' }
      );

    return { ok: true };
  });

export const trackContentDownload = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { contentId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();
    if (!email) return { ok: false };

    await supabaseAdmin
      .from('user_content_progress' as any)
      .upsert(
        {
          user_email: email,
          content_id: data.contentId,
          downloaded_at: new Date().toISOString(),
          viewed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
        },
        { onConflict: 'user_email,content_id' }
      );

    return { ok: true };
  });

export const updateWatchPosition = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { contentId: string, positionSeconds: number }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();
    if (!email) return { ok: false };

    await supabaseAdmin
      .from('user_content_progress' as any)
      .upsert(
        {
          user_email: email,
          content_id: data.contentId,
          last_position_seconds: data.positionSeconds,
          viewed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
        },
        { onConflict: 'user_email,content_id' }
      );

    return { ok: true };
  });

export const getUserProgress = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();
    if (!email) return { progress: [] };

    let query = supabaseAdmin
      .from('user_content_progress' as any)
      .select('*')
      .eq('user_email', email);


    const { data: progress } = await query;

    return { progress: progress || [] };
  });
