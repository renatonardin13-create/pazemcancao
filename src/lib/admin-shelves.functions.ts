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

    const { data, error } = await supabaseAdmin
      .from('shelves')
      .select('*, shelf_courses(id, course_id, sort_order, courses(id, title, status, cover_image_url))')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { shelves: data || [] };
  });

// ── Create shelf ──
const createShelfSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  is_active: z.boolean(),
  mode: z.enum(['manual', 'auto']),
  auto_criteria: z.string().max(50).optional(),
  sort_order: z.number().min(0).max(999).optional(),
});

export const createShelf = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; is_active: boolean; mode: string; auto_criteria?: string; sort_order?: number }) =>
    createShelfSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: shelf, error } = await supabaseAdmin
      .from('shelves')
      .insert({
        name: data.name,
        is_active: data.is_active,
        mode: data.mode,
        auto_criteria: data.mode === 'auto' ? (data.auto_criteria || 'recent') : null,
        sort_order: data.sort_order ?? 0,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { id: shelf.id };
  });

// ── Update shelf ──
const updateShelfSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).trim().optional(),
  is_active: z.boolean().optional(),
  mode: z.enum(['manual', 'auto']).optional(),
  auto_criteria: z.string().max(50).optional(),
  sort_order: z.number().min(0).max(999).optional(),
});

export const updateShelf = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; name?: string; is_active?: boolean; mode?: string; auto_criteria?: string; sort_order?: number }) =>
    updateShelfSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('shelves')
      .update(updates)
      .eq('id', id);

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
