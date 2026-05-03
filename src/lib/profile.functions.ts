import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const getMyProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get user email from auth
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email || '';

    // Get enrollments with course info
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, courses(id, title, course_type, cover_image_url, total_lessons)')
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    // Get lesson progress counts per course
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('course_id, completed, watched_seconds')
      .eq('user_id', userId);

    const completedByCourse: Record<string, number> = {};
    let totalWatchedSeconds = 0;
    if (progressData) {
      for (const p of progressData) {
        if (p.completed) {
          completedByCourse[p.course_id] = (completedByCourse[p.course_id] || 0) + 1;
        }
        totalWatchedSeconds += p.watched_seconds || 0;
      }
    }

    // Get content progress stats
    const { data: contentProgress } = await supabaseAdmin
      .from('user_content_progress')
      .select('content_id, viewed_at, completed_at, last_position_seconds')
      .eq('user_email', email.toLowerCase());

    let contentViewed = 0;
    let contentCompleted = 0;
    let contentTotalPositionSeconds = 0;
    if (contentProgress) {
      for (const cp of contentProgress) {
        if (cp.viewed_at) contentViewed++;
        if (cp.completed_at) contentCompleted++;
        contentTotalPositionSeconds += cp.last_position_seconds || 0;
      }
    }

    // Total time = lesson watched_seconds + content position seconds
    const totalSeconds = totalWatchedSeconds + contentTotalPositionSeconds;
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const timeWatchedLabel = totalHours > 0
      ? `${totalHours}h${totalMinutes > 0 ? `${totalMinutes}m` : ''}`
      : totalMinutes > 0 ? `${totalMinutes}m` : '0h';

    return {
      profile: profile || { user_id: userId, display_name: '', avatar_url: null, bio: null },
      email,
      enrollments: enrollments || [],
      completedByCourse,
      contentStats: {
        viewed: contentViewed,
        completed: contentCompleted,
        totalItems: contentProgress?.length || 0,
      },
      timeWatchedLabel,
    };
  });

export const updateMyProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { display_name?: string; bio?: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Upsert profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          display_name: data.display_name ?? null,
          bio: data.bio ?? null,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { profile };
  });

export const changePassword = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { newPassword: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteMyAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // 1. Delete DB records
    // We use RPC v2 which we created earlier.
    // Note: To use RPC v2 from context.supabase (which is a user client), we need it to have permissions.
    // But since it's SECURITY DEFINER and we revoked PUBLIC, only service_role can call it.
    // So we use supabaseAdmin here.
    const { error: dbError } = await supabaseAdmin.rpc('delete_user_account_v2', { target_user_id: userId });
    if (dbError) throw new Error(dbError.message);

    // 2. Delete Auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw new Error(authError.message);

    return { success: true };
  });
