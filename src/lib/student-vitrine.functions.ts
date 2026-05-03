import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

type CourseRow = {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  sales_description: string | null;
  cover_image_url: string | null;
  banner_image_url: string | null;
  price: number;
  promotional_price: number | null;
  benefits: string[] | null;
  total_lessons: number;
  total_duration: string | null;
  course_type: string;
  product_type: string;
  category_id: string | null;
  status: string;
  sort_order: number;
  launch_date: string | null;
};

type ShelfRow = {
  id: string;
  name: string;
  sort_order: number;
  mode: string;
  auto_criteria: string | null;
  show_in_vitrine: boolean;
};

type ShelfCourseRow = {
  shelf_id: string;
  course_id: string;
  sort_order: number;
};

function safeCourse(course: any) {
  if (!course?.id) return null;
  return {
    id: course.id,
    title: course.title || 'Curso sem título',
    short_description: course.short_description ?? null,
    full_description: course.full_description ?? null,
    sales_description: course.sales_description ?? null,
    cover_image_url: course.cover_image_url ?? null,
    banner_image_url: course.banner_image_url ?? null,
    price: Number(course.price ?? 0),
    promotional_price: course.promotional_price ?? null,
    benefits: Array.isArray(course.benefits) ? course.benefits.filter(Boolean) : [],
    total_lessons: Number(course.total_lessons ?? 0),
    total_duration: course.total_duration ?? null,
    course_type: course.course_type || 'video',
    product_type: course.product_type || 'curso_individual',
    category_name: course.category_name ?? null,
    checkout_url: course.checkout_url ?? null,
    sales_page_url: course.sales_page_url ?? null,
    banner_link_url: course.banner_link_url ?? null,
    access_state: course.access_state ?? 'locked',
    progress_pct: Number(course.progress_pct ?? 0),
    launch_date: course.launch_date ?? null,
  };
}

export const getStudentVitrineData = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string }) => input)
  .handler(async ({ data: inputData, context }) => {
    const { supabase, userId } = context;

    // Use the authenticated supabase client from context instead of supabaseAdmin
    // to enforce RLS policies (area membership and published status).
    let coursesQuery = supabase
      .from('courses')
      .select('id, title, short_description, full_description, sales_description, cover_image_url, banner_image_url, price, promotional_price, benefits, total_lessons, total_duration, course_type, product_type, category_id, status, sort_order, launch_date')
      .eq('status', 'published');

    if (inputData?.areaId) {
      coursesQuery = coursesQuery.eq('area_id', inputData.areaId);
    } else {
      return { shelves: [], heroBanners: [], featuredCourse: null, featuredCourses: [], promoBanners: [] };
    }

    const [
      shelvesRes,
      shelfCoursesRes,
      coursesRes,
      categoriesRes,
      integrationsRes,
      enrollmentsRes,
      heroBannerRes,
      heroBannersListRes,
    ] = await Promise.all([
      (() => {
        let q = supabase
          .from('shelves')
          .select('id, name, sort_order, mode, auto_criteria, show_in_vitrine')
          .eq('is_active', true);
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        else q = q.is('id', null);
        return q.order('sort_order', { ascending: true });
      })(),
      supabase
        .from('shelf_courses')
        .select('shelf_id, course_id, sort_order')
        .order('sort_order', { ascending: true }),
      coursesQuery.order('sort_order', { ascending: true }),
      (() => {
        let q = supabase.from('categories').select('id, name');
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        else q = q.is('id', null);
        return q;
      })(),
      // course_integrations might still need admin if it's sensitive, but let's check
      supabaseAdmin.from('course_integrations').select('course_id, checkout_url').eq('is_enabled', true),
      supabase
        .from('enrollments')
        .select('course_id, status, expires_at, progress_percentage')
        .eq('user_id', userId),
      // platform_settings might need admin if RLS is tight
      supabaseAdmin.from('platform_settings').select('value').eq('key', 'hero_banner').maybeSingle(),
      (() => {
        let q = (supabase as any)
          .from('vitrine_hero_banners')
          .select('id, image_url, image_tablet_url, image_mobile_url, title, subtitle, description, primary_cta_label, primary_cta_url, primary_cta_type, primary_cta_target, secondary_cta_label, secondary_cta_url, secondary_cta_type, secondary_cta_target, banner_clickable, banner_click_type, banner_click_target, autoplay, autoplay_interval_ms, is_active, sort_order, schedule_start_at, schedule_end_at')
          .eq('is_active', true);
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        else q = q.is('id', null);
        return q.order('sort_order', { ascending: true });
      })(),
    ]);

    if (shelvesRes.error) throw new Error(shelvesRes.error.message);
    if (shelfCoursesRes.error) throw new Error(shelfCoursesRes.error.message);
    if (coursesRes.error) throw new Error(coursesRes.error.message);
    if (categoriesRes.error) throw new Error(categoriesRes.error.message);
    if (integrationsRes.error) throw new Error(integrationsRes.error.message);
    if (enrollmentsRes.error) throw new Error(enrollmentsRes.error.message);

    const shelves = ((shelvesRes.data || []) as ShelfRow[]).filter((shelf) => shelf.show_in_vitrine !== false);
    const shelfCourses = (shelfCoursesRes.data || []) as ShelfCourseRow[];
    const courses = (coursesRes.data || []) as CourseRow[];
    const categories = new Map((categoriesRes.data || []).map((item: any) => [item.id, item.name]));
    const integrations = new Map((integrationsRes.data || []).map((item: any) => [item.course_id, item.checkout_url]));

    const activeOwned = new Set<string>();
    for (const enrollment of enrollmentsRes.data || []) {
      const expired = enrollment.expires_at && new Date(enrollment.expires_at).getTime() < Date.now();
      if (enrollment.status === 'active' && !expired) activeOwned.add(enrollment.course_id);
    }

    const courseMap = new Map(
      courses.map((course) => {
        const owned = activeOwned.has(course.id);
        const launchDate = course.launch_date ? new Date(course.launch_date) : null;
        const comingSoon = !owned && !!launchDate && launchDate.getTime() > Date.now();
        const accessState = owned ? 'enrolled' : comingSoon ? 'coming_soon' : 'locked';

        return [
          course.id,
          safeCourse({
            ...course,
            category_name: course.category_id ? categories.get(course.category_id) || null : null,
            checkout_url: integrations.get(course.id) || null,
            access_state: accessState,
            progress_pct: 0,
          }),
        ];
      }),
    );

    const linksByShelf = new Map<string, ShelfCourseRow[]>();
    for (const link of shelfCourses) {
      const list = linksByShelf.get(link.shelf_id) || [];
      list.push(link);
      linksByShelf.set(link.shelf_id, list);
    }

    type BuiltShelf = {
      id: string;
      name: string;
      sort_order: number;
      shelf_type: 'admin';
      courses: any[];
    };

    const builtShelves: BuiltShelf[] = shelves.map((shelf) => {
      const coursesForShelf = (linksByShelf.get(shelf.id) || [])
        .map((link) => courseMap.get(link.course_id))
        .filter(Boolean) as any[];

      return {
        id: shelf.id,
        name: shelf.name || 'Prateleira',
        sort_order: shelf.sort_order ?? 0,
        shelf_type: 'admin' as const,
        courses: coursesForShelf,
      };
    }).filter((shelf) => shelf.courses.length > 0);

    const shownIds = new Set(builtShelves.flatMap((shelf) => shelf.courses.map((course: any) => course.id)));
    const orphanCourses = courses
      .filter((course) => course.status === 'published' && !shownIds.has(course.id))
      .map((course) => courseMap.get(course.id))
      .filter(Boolean) as any[];

    if (orphanCourses.length > 0) {
      // Agrupa órfãos pela categoria real do curso; cursos sem categoria
      // caem em uma seção discreta "Sem categoria".
      const groups = new Map<string, { name: string; courses: any[] }>();
      const FALLBACK_KEY = '__uncategorized__';
      const FALLBACK_NAME = 'Sem categoria';

      for (const course of orphanCourses) {
        const rawName = (course?.category_name || '').trim();
        const key = rawName ? `cat:${rawName.toLowerCase()}` : FALLBACK_KEY;
        const name = rawName || FALLBACK_NAME;
        const bucket = groups.get(key) || ({ name, courses: [] as any[] });
        bucket.courses.push(course);
        groups.set(key, bucket);
      }

      const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
        if (a === FALLBACK_KEY) return 1;
        if (b === FALLBACK_KEY) return -1;
        return groups.get(a)!.name.localeCompare(groups.get(b)!.name, 'pt-BR');
      });

      let offset = 0;
      for (const key of sortedKeys) {
        const group = groups.get(key)!;
        builtShelves.push({
          id: `__cat__${key}`,
          name: group.name,
          sort_order: 9000 + offset++,
          shelf_type: 'admin' as const,
          courses: group.courses,
        });
      }
    }

    const hero = heroBannerRes.data?.value as any;
    const rawHeroBanners = Array.isArray(heroBannersListRes?.data) ? heroBannersListRes.data : [];
    const nowMs = Date.now();
    const scheduledHeroBanners = rawHeroBanners.filter((b: any) => {
      const startOk = !b.schedule_start_at || new Date(b.schedule_start_at).getTime() <= nowMs;
      const endOk = !b.schedule_end_at || new Date(b.schedule_end_at).getTime() >= nowMs;
      return startOk && endOk;
    });

    // Compatibilidade: configuração antiga do hero só controla o fallback legado.
    // Banners reais cadastrados em vitrine_hero_banners têm prioridade e devem aparecer
    // sempre que estiverem ativos/agendados corretamente.
    const legacyHeroEnabled = hero == null ? true : hero?.enabled !== false;

    const configuredHero = legacyHeroEnabled && hero?.enabled && typeof hero?.course_id === 'string'
      ? courseMap.get(hero.course_id)
      : null;
    const fallbackHero = legacyHeroEnabled
      ? (builtShelves.flatMap((shelf) => shelf.courses).find((course: any) => course?.banner_image_url || course?.cover_image_url) || null)
      : null;
    const featuredCourse = scheduledHeroBanners.length === 0 && legacyHeroEnabled
      ? safeCourse(
          configuredHero
            ? {
                ...configuredHero,
                display_title: hero?.title || configuredHero.title,
                display_subtitle: hero?.subtitle || configuredHero.short_description,
                banner_image_url: hero?.image_url || configuredHero.banner_image_url || configuredHero.cover_image_url,
                banner_link_url: hero?.link_url || configuredHero.banner_link_url || configuredHero.checkout_url,
              }
            : fallbackHero,
        )
      : null;

    const heroBanners = scheduledHeroBanners;

    return {
      shelves: builtShelves,
      featuredCourse,
      featuredCourses: featuredCourse ? [featuredCourse] : [],
      heroBanners,
      promoBanners: [],
    };
  });
