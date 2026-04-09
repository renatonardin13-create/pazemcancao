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
      .select('course_id, completed')
      .eq('user_id', userId)
      .eq('completed', true);

    const completedByCourse: Record<string, number> = {};
    if (progressData) {
      for (const p of progressData) {
        completedByCourse[p.course_id] = (completedByCourse[p.course_id] || 0) + 1;
      }
    }

    return {
      profile: profile || { user_id: userId, display_name: '', avatar_url: null, bio: null },
      email,
      enrollments: enrollments || [],
      completedByCourse,
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
