import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

async function verifyAdmin(supabase: any, userId: string) {
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  const { data: userData } = await supabase.auth.getUser();
  const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

  if (!role && !isAdminEmail) throw new Error('Não autorizado');
}

export const listAdminTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    status?: string;
    areaId?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const page = data.page || 1;
    const pageSize = data.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from('tracks')
      .select('*', { count: 'exact' });

    if (data.search) {
      query = query.ilike('title', `%${data.search}%`);
    }
    if (data.category && data.category !== 'all') {
      query = query.eq('category', data.category);
    }
    if (data.status === 'active') {
      query = query.eq('is_active', true);
    } else if (data.status === 'inactive') {
      query = query.eq('is_active', false);
    }
    if (data.areaId && data.areaId !== 'all') {
      query = query.eq('area_id', data.areaId);
    }

    const { data: tracks, error, count } = await query
      .order('sort_order', { ascending: true })
      .range(from, to);

    if (error) throw new Error(error.message);
    return { tracks: tracks || [], total: count || 0, page, pageSize };
  });

export const listAdminTrackCategories = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string }) => input)
  .handler(async ({ data: inputData, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    let query = supabaseAdmin
      .from('tracks')
      .select('category');

    if (inputData?.areaId && inputData.areaId !== 'all') {
      query = query.eq('area_id', inputData.areaId);
    }

    const { data, error } = await query;
    const categories = Array.from(new Set((data || []).map((t: any) => t.category))).sort();
    return { categories };
  });

export const createTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    title: string;
    category: string;
    duration: string;
    storage_path: string;
    area_id?: string;
    cover_url?: string;
    download_url?: string;
    description?: string;
    is_bonus?: boolean;
    bonus_release_date?: string | null;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: maxOrder } = await supabaseAdmin
      .from('tracks')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const { data: track, error } = await supabaseAdmin
      .from('tracks')
      .insert({
        title: data.title,
        category: data.category,
        duration: data.duration,
        storage_path: data.storage_path,
        area_id: data.area_id || null,
        cover_url: data.cover_url || null,
        download_url: data.download_url || null,
        description: data.description || null,
        is_active: true,
        is_bonus: data.is_bonus || false,
        bonus_release_date: data.bonus_release_date || null,
        sort_order: (maxOrder?.sort_order ?? 0) + 1,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { track };
  });

export const updateTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    title?: string;
    category?: string;
    duration?: string;
    storage_path?: string;
    area_id?: string;
    cover_url?: string;
    download_url?: string;
    description?: string;
    is_active?: boolean;
    is_bonus?: boolean;
    bonus_release_date?: string | null;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    // Empty string means "remove cover"
    if ('cover_url' in updates && updates.cover_url === '') {
      (updates as any).cover_url = null;
    }
    const { error } = await supabaseAdmin
      .from('tracks')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('tracks')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const regenerateCover = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { trackId: string; title: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const prompt = `Create a stunning album cover artwork. No text, no words, no letters, no typography. Style: cinematic digital painting, volumetric lighting, rich color palette, ethereal atmosphere. The mood and scene should be inspired by the song title "${data.title}". Make it feel like a premium streaming platform cover art.`;

    const aiResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3.1-flash-image-preview',
          messages: [{ role: 'user', content: prompt }],
          modalities: ['image', 'text'],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errText);
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData || !imageData.startsWith('data:image')) {
      throw new Error('No image returned from AI');
    }

    const base64Data = imageData.split(',')[1];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const fileName = `covers/${data.trackId}.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('covers')
      .upload(fileName, bytes, { contentType: 'image/png', upsert: true });

    if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

    const { data: urlData } = supabaseAdmin.storage
      .from('covers')
      .getPublicUrl(fileName);

    const coverUrl = urlData.publicUrl;

    await supabaseAdmin
      .from('tracks')
      .update({ cover_url: coverUrl })
      .eq('id', data.trackId);

    return { coverUrl };
  });
