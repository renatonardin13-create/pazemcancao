import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';

// ── Helper: verify admin ──
async function verifyAdmin(supabase: any, userId: string) {
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
  return userData?.user;
}

// ── List courses for selector ──
export const listCoursesForSelector = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('id, title, status, cover_image_url, banner_image_url, short_description')
      .order('title', { ascending: true });

    if (error) throw new Error(error.message);
    return { courses: data || [] };
  });

// ── Create student with optional course enrollments ──
const addStudentSchema = z.object({
  nome: z.string().min(1).max(255).trim(),
  email: z.string().email().max(255).trim(),
  access_enabled: z.boolean(),
  courseIds: z.array(z.string().uuid()).max(50).optional(),
  is_trial: z.boolean().optional(),
  trialDays: z.number().min(1).max(365).optional(),
});

export const addStudent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { nome: string; email: string; access_enabled: boolean; courseIds?: string[]; is_trial?: boolean; trialDays?: number }) =>
    addStudentSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const email = data.email.toLowerCase().trim();

    // Check if buyer already exists — block duplicate
    const { data: existing } = await supabaseAdmin
      .from('approved_buyers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new Error('Já existe um aluno cadastrado com este e-mail.');
    }

    // Build buyer record
    const isTrial = data.is_trial === true && (data.trialDays ?? 0) > 0;
    let trialExpiresAt: string | null = null;
    if (isTrial) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (data.trialDays ?? 7));
      trialExpiresAt = expiresAt.toISOString();
    }

    // Create approved_buyer
    const { data: inserted, error } = await supabaseAdmin
      .from('approved_buyers')
      .insert({
        email,
        nome: data.nome,
        access_enabled: data.access_enabled,
        status: isTrial ? 'trial' : 'approved',
        is_trial: isTrial,
        trial_expires_at: trialExpiresAt,
        can_download: !isTrial,
      })
      .select('id')
      .single();

    if (error) throw new Error(`Erro ao criar registro do aluno: ${error.message}`);
    const buyerId = inserted.id;

    // Create auth user if needed — use getUserByEmail for reliable lookup
    const generatedPassword = 'Paz' + Math.random().toString(36).slice(2, 8) + '!';

    let authUserId: string;
    let existingUser = null;

    // Try to find user by email directly (more reliable than listUsers)
    try {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      existingUser = listData?.users?.find((u) => u.email?.toLowerCase() === email) ?? null;
    } catch {
      // Fallback: ignore list error
    }

    if (!existingUser) {
      const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { full_name: data.nome },
      });

      if (authErr) {
        // If user already exists but wasn't found in list, try to update instead
        if (authErr.message?.includes('already been registered') || authErr.message?.includes('already exists')) {
          const { data: retryList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          existingUser = retryList?.users?.find((u) => u.email?.toLowerCase() === email) ?? null;
          if (!existingUser) {
            throw new Error(`Erro ao criar conta de autenticação: ${authErr.message}`);
          }
        } else {
          throw new Error(`Erro ao criar conta de autenticação: ${authErr.message}`);
        }
      } else {
        authUserId = created.user.id;
      }
    }

    if (existingUser) {
      // Update password, confirm email, and ensure user is not banned
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: generatedPassword,
        email_confirm: true,
        ban_duration: 'none',
        user_metadata: { full_name: data.nome },
      });
      if (updateErr) {
        console.error('Error updating auth user:', updateErr);
      }
      authUserId = existingUser.id;
    }

    authUserId = authUserId!;

    // Ensure profile exists (fallback in case trigger didn't fire)
    await supabaseAdmin
      .from('profiles')
      .upsert(
        { user_id: authUserId, display_name: data.nome },
        { onConflict: 'user_id' }
      );

    // Clear any previous security blocks for this email
    await supabaseAdmin
      .from('user_access_logs')
      .delete()
      .eq('email', email)
      .eq('is_blocked', true);

    // Invalidate old sessions so user starts fresh
    await supabaseAdmin
      .from('active_sessions')
      .update({ is_valid: false })
      .eq('email', email);

    // Create enrollments for selected courses
    const selectedCourseIds = Array.from(new Set(data.courseIds ?? []));

    if (selectedCourseIds.length > 0) {
      const { data: validCourses, error: coursesError } = await supabaseAdmin
        .from('courses')
        .select('id')
        .in('id', selectedCourseIds);

      if (coursesError) throw new Error(coursesError.message);

      const validCourseIds = new Set((validCourses || []).map((course: { id: string }) => course.id));
      const invalidCourseIds = selectedCourseIds.filter((courseId) => !validCourseIds.has(courseId));

      if (invalidCourseIds.length > 0) {
        throw new Error('Um ou mais cursos selecionados não são válidos.');
      }

      const grantedAt = new Date().toISOString();
      const enrollmentRows = selectedCourseIds.map((courseId) => ({
        user_id: authUserId,
        course_id: courseId,
        status: 'active',
        access_origin: 'admin_manual',
        email,
        granted_at: grantedAt,
      }));

      const { error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .upsert(enrollmentRows, { onConflict: 'user_id,course_id' });

      if (enrollError) {
        throw new Error(`Erro ao criar vínculos dos cursos: ${enrollError.message}`);
      }
    }

    return { success: true, generatedPassword, buyerId, isTrial, trialExpiresAt };
  });

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

    // Generate a readable password for the trial user
    const generatedPassword = 'Paz' + Math.random().toString(36).slice(2, 8) + '!';

    // Create auth user if doesn't exist
    let existingUser = null;
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      existingUser = userList?.users?.find((u) => u.email?.toLowerCase() === email) ?? null;
    } catch { /* ignore */ }

    let authUserId: string;
    if (!existingUser) {
      const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { full_name: data.nome },
      });
      if (authErr) {
        if (authErr.message?.includes('already been registered') || authErr.message?.includes('already exists')) {
          const { data: retryList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          existingUser = retryList?.users?.find((u) => u.email?.toLowerCase() === email) ?? null;
          if (!existingUser) throw new Error(`Erro ao criar conta: ${authErr.message}`);
        } else {
          throw new Error(`Erro ao criar conta: ${authErr.message}`);
        }
      } else {
        authUserId = created.user.id;
      }
    }

    if (existingUser) {
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: generatedPassword,
        email_confirm: true,
        ban_duration: 'none',
        user_metadata: { full_name: data.nome },
      });
      if (updateErr) console.error('Error updating auth user:', updateErr);
      authUserId = existingUser.id;
    }

    authUserId = authUserId!;

    // Ensure profile exists
    await supabaseAdmin
      .from('profiles')
      .upsert(
        { user_id: authUserId, display_name: data.nome },
        { onConflict: 'user_id' }
      );

    // Clear any security blocks
    await supabaseAdmin
      .from('user_access_logs')
      .delete()
      .eq('email', email)
      .eq('is_blocked', true);

    // Invalidate old sessions
    await supabaseAdmin
      .from('active_sessions')
      .update({ is_valid: false })
      .eq('email', email);

    return { success: true, expiresAt: expiresAt.toISOString(), generatedPassword };
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

    const { data: buyer, error: buyerError } = await supabaseAdmin
      .from('approved_buyers')
      .select('email, is_trial')
      .eq('id', data.buyerId)
      .single();

    if (buyerError || !buyer) throw new Error(buyerError?.message || 'Aluno não encontrado');

    const email = buyer.email.toLowerCase();
    const now = new Date().toISOString();
    const nextBuyerStatus = data.access_enabled ? (buyer.is_trial ? 'trial' : 'approved') : 'blocked';

    const { error } = await supabaseAdmin
      .from('approved_buyers')
      .update({ access_enabled: data.access_enabled, status: nextBuyerStatus })
      .eq('id', data.buyerId);

    if (error) throw new Error(error.message);

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const authUser = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === email) ?? null;

    const updateBlockedEnrollments = async (match: { email?: string; user_id?: string }) => {
      const query = supabaseAdmin
        .from('enrollments')
        .update({
          status: data.access_enabled ? 'active' : 'blocked',
          updated_at: now,
          notes: data.access_enabled ? 'manual_unblock' : 'manual_block',
        });

      if (match.email) query.eq('email', match.email);
      if (match.user_id) query.eq('user_id', match.user_id);
      query.eq('status', data.access_enabled ? 'blocked' : 'active');
      await query;
    };

    await updateBlockedEnrollments({ email });
    if (authUser?.id) await updateBlockedEnrollments({ user_id: authUser.id });

    return { success: true, access_enabled: data.access_enabled };
  });

// ── Get student details (enrollments + progress + latest events) ──
export const getStudentDetails = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const email = data.email.toLowerCase().trim();

    const { data: allCourses } = await supabaseAdmin
      .from('courses')
      .select('id, title, cover_image_url, status')
      .order('title', { ascending: true });

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const authUser = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === email);

    const [emailEnrollmentsRes, userEnrollmentsRes, lessonProgressRes, allLessonsRes, webhookLogsRes] = await Promise.all([
      supabaseAdmin
        .from('enrollments')
        .select('id, course_id, status, progress_percentage, access_origin, granted_at, updated_at, expires_at, notes, email, user_id')
        .eq('email', email),
      authUser
        ? supabaseAdmin
            .from('enrollments')
            .select('id, course_id, status, progress_percentage, access_origin, granted_at, updated_at, expires_at, notes, email, user_id')
            .eq('user_id', authUser.id)
        : Promise.resolve({ data: [] as any[] }),
      authUser
        ? supabaseAdmin.from('lesson_progress').select('course_id, completed').eq('user_id', authUser.id)
        : Promise.resolve({ data: [] as any[] }),
      supabaseAdmin.from('lessons').select('id, course_id'),
      supabaseAdmin
        .from('webhook_logs')
        .select('event_type, processed_at, response_message, internal_course_id')
        .eq('email', email)
        .order('processed_at', { ascending: false })
        .limit(200),
    ]);

    const normalizeEnrollmentStatus = (enrollment: any) => {
      if (enrollment.status === 'active' && enrollment.expires_at && new Date(enrollment.expires_at).getTime() < Date.now()) {
        return 'expired';
      }
      return enrollment.status || 'none';
    };

    const mergedByCourse = new Map<string, any>();
    const allEnrollments = [...(emailEnrollmentsRes.data || []), ...(userEnrollmentsRes.data || [])];

    for (const enrollment of allEnrollments) {
      const existing = mergedByCourse.get(enrollment.course_id);
      const nextTs = new Date(enrollment.updated_at || enrollment.granted_at || 0).getTime();
      const existingTs = existing ? new Date(existing.updated_at || existing.granted_at || 0).getTime() : 0;
      const nextStatus = normalizeEnrollmentStatus(enrollment);
      const existingStatus = existing ? normalizeEnrollmentStatus(existing) : null;

      if (!existing || nextTs > existingTs || (nextTs === existingTs && existingStatus !== 'active' && nextStatus === 'active')) {
        mergedByCourse.set(enrollment.course_id, enrollment);
      }
    }

    const latestWebhookByCourse = new Map<string, any>();
    for (const log of webhookLogsRes.data || []) {
      if (!log.internal_course_id) continue;
      if (!latestWebhookByCourse.has(log.internal_course_id)) {
        latestWebhookByCourse.set(log.internal_course_id, log);
      }
    }

    const lessonProgress = lessonProgressRes.data || [];
    const allLessons = allLessonsRes.data || [];

    const coursesWithState = (allCourses || []).map((course: any) => {
      const enrollment = mergedByCourse.get(course.id) || null;
      const enrollmentStatus = enrollment ? normalizeEnrollmentStatus(enrollment) : 'none';
      const hasAccess = enrollmentStatus === 'active';
      const totalLessons = allLessons.filter((l: any) => l.course_id === course.id).length;
      const completedLessons = lessonProgress.filter((p: any) => p.course_id === course.id && p.completed).length;
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const latestWebhook = latestWebhookByCourse.get(course.id) || null;

      return {
        ...course,
        hasAccess,
        status: enrollmentStatus,
        accessOrigin: enrollment?.access_origin || null,
        lastEventType: latestWebhook?.event_type || enrollment?.notes || null,
        lastEventAt: latestWebhook?.processed_at || enrollment?.updated_at || enrollment?.granted_at || null,
        lastEventMessage: latestWebhook?.response_message || null,
        expiresAt: enrollment?.expires_at || null,
        totalLessons,
        completedLessons,
        progressPct,
      };
    });

    const activeCourses = coursesWithState.filter((c: any) => c.status === 'active');
    const overallProgress = activeCourses.length > 0
      ? Math.round(activeCourses.reduce((sum: number, c: any) => sum + c.progressPct, 0) / activeCourses.length)
      : 0;

    return {
      courses: coursesWithState,
      enrolledCount: activeCourses.length,
      overallProgress,
      userId: authUser?.id || null,
    };
  });

// ── Toggle course enrollment for a student ──
export const toggleStudentCourseAccess = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; courseId: string; grant: boolean }) =>
    z.object({ email: z.string().email(), courseId: z.string().uuid(), grant: z.boolean() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const email = data.email.toLowerCase().trim();
    const now = new Date().toISOString();

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    let authUser = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === email);

    if (data.grant) {
      if (!authUser) {
        const { data: buyerRow } = await supabaseAdmin
          .from('approved_buyers')
          .select('nome')
          .eq('email', email)
          .maybeSingle();

        const tempPassword = `Pwd${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}!`;
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: buyerRow?.nome || email.split('@')[0] },
        });
        if (createErr || !created?.user) {
          throw new Error(`Não foi possível criar o usuário: ${createErr?.message || 'erro desconhecido'}`);
        }
        authUser = created.user;
      }

      const { error: upsertError } = await supabaseAdmin
        .from('enrollments')
        .upsert(
          {
            user_id: authUser.id,
            course_id: data.courseId,
            email,
            access_origin: 'admin_manual',
            status: 'active',
            expires_at: null,
            updated_at: now,
            granted_at: now,
            notes: 'manual_grant',
          },
          { onConflict: 'user_id,course_id' }
        );

      if (upsertError) throw new Error(upsertError.message);
    } else {
      if (authUser) {
        await supabaseAdmin
          .from('enrollments')
          .update({ status: 'blocked', updated_at: now, notes: 'manual_block' })
          .eq('user_id', authUser.id)
          .eq('course_id', data.courseId)
          .eq('status', 'active');
      }

      await supabaseAdmin
        .from('enrollments')
        .update({ status: 'blocked', updated_at: now, notes: 'manual_block' })
        .eq('email', email)
        .eq('course_id', data.courseId)
        .eq('status', 'active');
    }

    return { success: true };
  });
