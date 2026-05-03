import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';

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
}

// ── List shelves with linked courses ──
export const listShelves = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: shelves, error } = await supabaseAdmin
      .from('shelves')
      .select('*, shelf_courses(id, course_id, sort_order, courses(id, title, status, cover_image_url))')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { shelves: shelves || [] };
  });

// ── Create shelf ──
const createShelfSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  public_title: z.string().max(255).trim().nullable().optional(),
  description: z.string().max(500).trim().nullable().optional(),
  is_active: z.boolean(),
  show_in_vitrine: z.boolean().optional(),
  mode: z.enum(['manual', 'auto']),
  auto_criteria: z.string().max(50).optional(),
  display_mode: z.enum(['auto', 'grid', 'carousel']).optional(),
  sort_order: z.number().min(0).max(999).optional(),
});

export const createShelf = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; public_title?: string | null; description?: string | null; is_active: boolean; show_in_vitrine?: boolean; mode: string; auto_criteria?: string; display_mode?: string; sort_order?: number }) =>
    createShelfSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: shelf, error } = await supabaseAdmin
      .from('shelves')
      .insert({
        name: data.name,
        public_title: data.public_title?.trim() || null,
        description: data.description?.trim() || null,
        is_active: data.is_active,
        show_in_vitrine: data.show_in_vitrine ?? true,
        mode: data.mode,
        auto_criteria: data.mode === 'auto' ? (data.auto_criteria || 'recent') : null,
        display_mode: data.display_mode ?? 'auto',
        sort_order: data.sort_order ?? 0,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { id: shelf.id };
  });

// ── Duplicate shelf (copy with linked courses) ──
export const duplicateShelf = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: original, error: fetchErr } = await supabaseAdmin
      .from('shelves')
      .select('*')
      .eq('id', data.id)
      .single();
    if (fetchErr || !original) throw new Error(fetchErr?.message || 'Prateleira não encontrada');

    const { data: created, error: insertErr } = await supabaseAdmin
      .from('shelves')
      .insert({
        name: `${original.name} (cópia)`,
        public_title: original.public_title,
        description: original.description,
        is_active: false,
        show_in_vitrine: original.show_in_vitrine,
        mode: original.mode,
        auto_criteria: original.auto_criteria,
        display_mode: original.display_mode,
        sort_order: (original.sort_order ?? 0) + 1,
      })
      .select('id')
      .single();
    if (insertErr || !created) throw new Error(insertErr?.message || 'Falha ao duplicar');

    const { data: links } = await supabaseAdmin
      .from('shelf_courses')
      .select('course_id, sort_order, is_featured')
      .eq('shelf_id', data.id);

    if (links && links.length > 0) {
      const rows = links.map((l: any) => ({
        shelf_id: created.id,
        course_id: l.course_id,
        sort_order: l.sort_order,
        is_featured: l.is_featured ?? false,
      }));
      await supabaseAdmin.from('shelf_courses').insert(rows);
    }

    return { id: created.id };
  });

// ── Update shelf ──
const updateShelfSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).trim().optional(),
  public_title: z.string().max(255).trim().nullable().optional(),
  description: z.string().max(500).trim().nullable().optional(),
  is_active: z.boolean().optional(),
  show_in_vitrine: z.boolean().optional(),
  mode: z.enum(['manual', 'auto']).optional(),
  auto_criteria: z.string().max(50).optional(),
  display_mode: z.enum(['auto', 'grid', 'carousel']).optional(),
  sort_order: z.number().min(0).max(999).optional(),
});

export const updateShelf = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; name?: string; public_title?: string | null; description?: string | null; is_active?: boolean; show_in_vitrine?: boolean; mode?: string; auto_criteria?: string; display_mode?: string; sort_order?: number }) =>
    updateShelfSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, public_title, description, ...rest } = data;
    const updates: any = { ...rest };
    if (public_title !== undefined) updates.public_title = public_title?.trim() || null;
    if (description !== undefined) updates.description = description?.trim() || null;

    const { error } = await supabaseAdmin
      .from('shelves')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Toggle featured flag of a course inside a shelf ──
export const setShelfCourseFeatured = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { shelfId: string; courseId: string; isFeatured: boolean }) =>
    z.object({
      shelfId: z.string().uuid(),
      courseId: z.string().uuid(),
      isFeatured: z.boolean(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from('shelf_courses')
      .update({ is_featured: data.isFeatured })
      .eq('shelf_id', data.shelfId)
      .eq('course_id', data.courseId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Delete shelf ──
export const deleteShelf = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('shelves')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Set shelf courses (replace all) ──
const setShelfCoursesSchema = z.object({
  shelfId: z.string().uuid(),
  courseIds: z.array(z.string().uuid()).max(50),
});

export const setShelfCourses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { shelfId: string; courseIds: string[] }) =>
    setShelfCoursesSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    // Delete existing
    await supabaseAdmin
      .from('shelf_courses')
      .delete()
      .eq('shelf_id', data.shelfId);

    // Insert new
    if (data.courseIds.length > 0) {
      const rows = data.courseIds.map((courseId, i) => ({
        shelf_id: data.shelfId,
        course_id: courseId,
        sort_order: i,
      }));

      const { error } = await supabaseAdmin
        .from('shelf_courses')
        .insert(rows);

      if (error) throw new Error(error.message);
    }

    return { success: true };
  });

// ── Reorder shelves (batch update sort_order) ──
const reorderShelvesSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).max(100),
});

export const reorderShelves = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderedIds: string[] }) =>
    reorderShelvesSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    for (let i = 0; i < data.orderedIds.length; i++) {
      const { error } = await supabaseAdmin
        .from('shelves')
        .update({ sort_order: i })
        .eq('id', data.orderedIds[i]);
      if (error) throw new Error(error.message);
    }

    return { success: true };
  });

// ── Reorder courses within a shelf ──
const reorderShelfCoursesSchema = z.object({
  shelfId: z.string().uuid(),
  orderedCourseIds: z.array(z.string().uuid()).min(1).max(100),
});

export const reorderShelfCourses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { shelfId: string; orderedCourseIds: string[] }) =>
    reorderShelfCoursesSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    for (let i = 0; i < data.orderedCourseIds.length; i++) {
      const { error } = await supabaseAdmin
        .from('shelf_courses')
        .update({ sort_order: i })
        .eq('shelf_id', data.shelfId)
        .eq('course_id', data.orderedCourseIds[i]);
      if (error) throw new Error(error.message);
    }

    return { success: true };
  });
