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

    // Create auth user if needed
    const generatedPassword = 'Paz' + Math.random().toString(36).slice(2, 8) + '!';
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );

    let authUserId: string;
    if (!existingUser) {
      const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
      });
      if (authErr) throw new Error(`Erro ao criar conta de autenticação: ${authErr.message}`);
      authUserId = created.user.id;
    } else {
      // Update password and ensure user is confirmed
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: generatedPassword,
        email_confirm: true,
      });
      authUserId = existingUser.id;
    }

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
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );

    let authUserId: string;
    if (!existingUser) {
      const { data: created, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
      });
      if (authErr) throw new Error(`Erro ao criar conta: ${authErr.message}`);
      authUserId = created.user.id;
    } else {
      // Update password for existing user
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: generatedPassword,
        email_confirm: true,
      });
      authUserId = existingUser.id;
    }

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

    const { error } = await supabaseAdmin
      .from('approved_buyers')
      .update({ access_enabled: data.access_enabled })
      .eq('id', data.buyerId);

    if (error) throw new Error(error.message);
    return { success: true, access_enabled: data.access_enabled };
  });

// ── Get student details (enrollments + progress) ──
export const getStudentDetails = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const email = data.email.toLowerCase().trim();

    // Get all courses
    const { data: allCourses } = await supabaseAdmin
      .from('courses')
      .select('id, title, cover_image_url, status')
      .order('title', { ascending: true });

    // Get enrollments for this user email
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id, course_id, status, progress_percentage')
      .eq('email', email)
      .eq('status', 'active');

    // Also check by user_id if user exists in auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const authUser = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === email);

    let enrollmentsByUserId: any[] = [];
    if (authUser) {
      const { data: uidEnrollments } = await supabaseAdmin
        .from('enrollments')
        .select('id, course_id, status, progress_percentage')
        .eq('user_id', authUser.id)
        .eq('status', 'active');
      enrollmentsByUserId = uidEnrollments || [];
    }

    // Merge enrollments (by email and by user_id)
    const enrolledCourseIds = new Set([
      ...(enrollments || []).map((e: any) => e.course_id),
      ...enrollmentsByUserId.map((e: any) => e.course_id),
    ]);

    // Get lesson progress if user exists
    let lessonProgress: any[] = [];
    if (authUser) {
      const { data: progress } = await supabaseAdmin
        .from('lesson_progress')
        .select('course_id, completed')
        .eq('user_id', authUser.id);
      lessonProgress = progress || [];
    }

    // Get total lessons per course
    const { data: allLessons } = await supabaseAdmin
      .from('lessons')
      .select('id, course_id');

    const coursesWithAccess = (allCourses || []).map((course: any) => {
      const hasAccess = enrolledCourseIds.has(course.id);
      const totalLessons = (allLessons || []).filter((l: any) => l.course_id === course.id).length;
      const completedLessons = lessonProgress.filter((p: any) => p.course_id === course.id && p.completed).length;
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...course,
        hasAccess,
        totalLessons,
        completedLessons,
        progressPct,
      };
    });

    const enrolledCourses = coursesWithAccess.filter((c: any) => c.hasAccess);
    const overallProgress = enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((sum: number, c: any) => sum + c.progressPct, 0) / enrolledCourses.length)
      : 0;

    return {
      courses: coursesWithAccess,
      enrolledCount: enrolledCourses.length,
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

    // Find auth user
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const authUser = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === email);

    if (data.grant) {
      if (!authUser) throw new Error('Usuário não encontrado no sistema de autenticação');

      // Check if enrollment already exists
      const { data: existing } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('course_id', data.courseId)
        .eq('status', 'active')
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from('enrollments').insert({
          user_id: authUser.id,
          course_id: data.courseId,
          email,
          access_origin: 'admin_manual',
          status: 'active',
        });
      }
    } else {
      // Remove enrollment
      if (authUser) {
        await supabaseAdmin
          .from('enrollments')
          .update({ status: 'cancelled' })
          .eq('user_id', authUser.id)
          .eq('course_id', data.courseId)
          .eq('status', 'active');
      }
      // Also remove by email
      await supabaseAdmin
        .from('enrollments')
        .update({ status: 'cancelled' })
        .eq('email', email)
        .eq('course_id', data.courseId)
        .eq('status', 'active');
    }

    return { success: true };
  });
