import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

type ShelfRecord = {
  id: string;
  name: string;
  is_active: boolean;
  mode: string;
  auto_criteria: string | null;
  sort_order: number;
  show_in_vitrine?: boolean;
  public_title?: string | null;
  description?: string | null;
  display_mode?: string | null;
};

type ShelfCourseLink = {
  shelf_id: string;
  course_id: string;
  sort_order: number;
  is_featured?: boolean;
};

type CourseRecord = {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  sales_description: string | null;
  cover_image_url: string | null;
  banner_image_url: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  price: number;
  promotional_price: number | null;
  benefits: string[];
  total_duration: string | null;
  total_lessons: number;
  product_type: string;
  category_id: string | null;
  launch_date?: string | null;
};

function sanitizeCourse(course: any) {
  if (!course || typeof course !== 'object' || !course.id) return null;

  return {
    ...course,
    title: course.title || 'Curso sem título',
    short_description: course.short_description ?? null,
    full_description: course.full_description ?? null,
    sales_description: course.sales_description ?? null,
    cover_image_url: course.cover_image_url ?? null,
    banner_image_url: course.banner_image_url ?? null,
    category_name: course.category_name ?? null,
    checkout_url: course.checkout_url ?? null,
    sales_page_url: course.sales_page_url ?? null,
    banner_link_url: course.banner_link_url ?? null,
    access_state: course.access_state ?? 'available',
    benefits: Array.isArray(course.benefits) ? course.benefits.filter(Boolean) : [],
    total_lessons: typeof course.total_lessons === 'number' ? course.total_lessons : 0,
    total_duration: course.total_duration ?? null,
    progress_pct: typeof course.progress_pct === 'number' ? course.progress_pct : 0,
    badge_text: course.badge_text ?? undefined,
  };
}

function sanitizeShelf(shelf: any) {
  if (!shelf || typeof shelf !== 'object' || !shelf.id) return null;

  const courses = Array.isArray(shelf.courses)
    ? shelf.courses.map(sanitizeCourse).filter(Boolean)
    : [];

  return {
    id: shelf.id,
    name: shelf.name || 'Prateleira',
    sort_order: typeof shelf.sort_order === 'number' ? shelf.sort_order : 0,
    shelf_type: shelf.shelf_type === 'smart' ? 'smart' : 'admin',
    courses,
  };
}

function resolveAutoShelfCourses(
  shelf: ShelfRecord,
  publishedCourses: CourseRecord[],
  enrichCourse: (course: CourseRecord) => any,
  salesCountMap: Map<string, number>,
  enrolledCourseIds: Set<string>,
) {
  switch (shelf.auto_criteria) {
    case 'recent':
      return [...publishedCourses]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)
        .map(enrichCourse);
    case 'best_selling':
      return [...publishedCourses]
        .sort((a, b) => {
          const salesDiff = (salesCountMap.get(b.id) || 0) - (salesCountMap.get(a.id) || 0);
          if (salesDiff !== 0) return salesDiff;
          return (a.sort_order || 0) - (b.sort_order || 0);
        })
        .slice(0, 20)
        .map(enrichCourse);
    case 'featured':
      return publishedCourses
        .filter((course) => (course.sort_order || 0) <= 5)
        .slice(0, 20)
        .map(enrichCourse);
    case 'enrolled':
      return publishedCourses
        .filter((course) => enrolledCourseIds.has(course.id))
        .map(enrichCourse);
    default:
      return publishedCourses.slice(0, 20).map(enrichCourse);
  }
}

// ── Get shelves, promo banners, and banner config for the student area ──
export const getStudentShelves = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
    const { supabase, userId } = context;

    // REGRA 8 — Não detectamos role admin aqui de propósito.
    // A vitrine do aluno deve obedecer exclusivamente às regras de acesso reais
    // (vínculo em enrollments). Admin não libera nada automaticamente.

    const { data: shelfRows, error: shelvesErr } = await supabaseAdmin
      .from('shelves')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (shelvesErr) throw new Error(shelvesErr.message);

    const shelves = (shelfRows || []).filter(
      (shelf: ShelfRecord) => shelf.show_in_vitrine !== false,
    ) as ShelfRecord[];

    const shelfIds = shelves.map((shelf) => shelf.id);
    let shelfCourseLinks: ShelfCourseLink[] = [];

    if (shelfIds.length > 0) {
      const { data: shelfCourseRows, error: shelfCoursesErr } = await supabaseAdmin
        .from('shelf_courses')
        .select('shelf_id, course_id, sort_order, is_featured')
        .in('shelf_id', shelfIds)
        .order('sort_order', { ascending: true });

      if (shelfCoursesErr) throw new Error(shelfCoursesErr.message);
      shelfCourseLinks = (shelfCourseRows || []) as ShelfCourseLink[];
    }

    // Sempre busca catálogo completo para montar a vitrine com dados reais,
    // incluindo cursos já publicados e cursos ainda não lançados.
    let catalogCourses: CourseRecord[] = [];
    {
      const { data: allCourses, error: coursesErr } = await supabaseAdmin
        .from('courses')
        .select('id, title, short_description, full_description, sales_description, cover_image_url, banner_image_url, status, sort_order, created_at, price, promotional_price, benefits, total_duration, total_lessons, product_type, category_id, launch_date')
        .in('status', ['published', 'draft'])
        .order('sort_order', { ascending: true });

      if (coursesErr) throw new Error(coursesErr.message);
      catalogCourses = (allCourses || []) as CourseRecord[];
    }

    const publishedCourses = catalogCourses.filter((course) => course.status === 'published');
    const publishedCourseIds = publishedCourses.map((course) => course.id);
    const categoryIds = Array.from(new Set(catalogCourses.map((course) => course.category_id).filter(Boolean))) as string[];

    let categoryRows: Array<{ id: string; name: string }> = [];
    if (categoryIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);

      if (error) throw new Error(error.message);
      categoryRows = data || [];
    }

    const categoryMap = new Map(categoryRows.map((category) => [category.id, category.name]));

    const { data: promoBanners, error: promoBannersError } = await supabase
      .from('promo_banners')
      .select('id, title, image_url, link_url, position_after_shelf, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (promoBannersError) throw new Error(promoBannersError.message);

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('course_id, status, expires_at')
      .eq('user_id', userId);

    if (enrollmentsError) throw new Error(enrollmentsError.message);

    const activeEnrollmentIds = new Set<string>();
    const blockedEnrollmentIds = new Set<string>();
    const expiredEnrollmentIds = new Set<string>();

    for (const enrollment of enrollments || []) {
      const isExpired = !!enrollment.expires_at && new Date(enrollment.expires_at) < new Date();

      if (enrollment.status === 'active' && !isExpired) {
        activeEnrollmentIds.add(enrollment.course_id);
      } else if (enrollment.status === 'blocked') {
        blockedEnrollmentIds.add(enrollment.course_id);
      } else if (isExpired || enrollment.status === 'expired') {
        expiredEnrollmentIds.add(enrollment.course_id);
      }
    }

    const enrolledCourseIds = activeEnrollmentIds;

    let lessonCounts: Array<{ course_id: string }> = [];
    if (publishedCourseIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('lessons')
        .select('course_id')
        .in('course_id', publishedCourseIds);

      if (error) throw new Error(error.message);
      lessonCounts = data || [];
    }

    let previewLessons: Array<{ course_id: string }> = [];
    if (publishedCourseIds.length > 0) {
      const { data, error } = await supabase
        .from('lessons')
        .select('course_id')
        .in('course_id', publishedCourseIds)
        .eq('is_free_preview', true);

      if (error) throw new Error(error.message);
      previewLessons = data || [];
    }

    const previewCourseIds = new Set(previewLessons.map((lesson) => lesson.course_id));

    let integrations: Array<{ course_id: string; checkout_url: string | null }> = [];
    if (publishedCourseIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('course_integrations')
        .select('course_id, checkout_url')
        .eq('is_enabled', true)
        .in('course_id', publishedCourseIds);

      if (error) throw new Error(error.message);
      integrations = data || [];
    }

    const integrationMap = new Map(
      integrations
        .filter((item) => !!item.checkout_url)
        .map((item) => [item.course_id, item.checkout_url]),
    );

    let allActiveEnrollments: Array<{ course_id: string }> = [];
    if (publishedCourseIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('enrollments')
        .select('course_id')
        .eq('status', 'active')
        .in('course_id', publishedCourseIds);

      if (error) throw new Error(error.message);
      allActiveEnrollments = data || [];
    }

    const salesCountMap = new Map<string, number>();
    for (const enrollment of allActiveEnrollments) {
      const current = salesCountMap.get(enrollment.course_id) || 0;
      salesCountMap.set(enrollment.course_id, current + 1);
    }

    const lessonCountMap = new Map<string, number>();
    for (const lesson of lessonCounts) {
      lessonCountMap.set(lesson.course_id, (lessonCountMap.get(lesson.course_id) || 0) + 1);
    }

    const enrolledIds = Array.from(activeEnrollmentIds);
    const completedLessonsMap = new Map<string, number>();
    let userProgressData: Array<{ course_id: string; lesson_id: string; completed: boolean; updated_at: string }> = [];

    if (enrolledIds.length > 0) {
      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('course_id, lesson_id, completed, updated_at')
        .eq('user_id', userId)
        .in('course_id', enrolledIds)
        .order('updated_at', { ascending: false });

      if (progressError) throw new Error(progressError.message);
      userProgressData = progressData || [];

      for (const progress of userProgressData) {
        if (progress.completed) {
          completedLessonsMap.set(
            progress.course_id,
            (completedLessonsMap.get(progress.course_id) || 0) + 1,
          );
        }
      }
    }

    const enrichCourse = (course: CourseRecord) => {
      // REGRA 8 — admin NÃO contamina visão do aluno na vitrine.
      // Acesso liberado SOMENTE com vínculo real em enrollments (status=active e não expirado).
      const isEnrolled = enrolledCourseIds.has(course.id);
      const isBlocked = blockedEnrollmentIds.has(course.id);
      const isExpired = expiredEnrollmentIds.has(course.id);
      const hasPreview = previewCourseIds.has(course.id);
      const checkoutUrl = integrationMap.get(course.id) || null;
      const hasCheckout = !!checkoutUrl;

      const totalLessons = lessonCountMap.get(course.id) || course.total_lessons || 0;
      const completedLessons = completedLessonsMap.get(course.id) || 0;
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // RC1: comprado > não-lançado > bloqueado
      const launchDate = (course as any).launch_date ? new Date((course as any).launch_date) : null;
      const isNotLaunched = !!launchDate && launchDate.getTime() > Date.now();

      let accessState: string;
      if (isEnrolled) {
        // LIBERADO — compra tem prioridade absoluta, mesmo se ainda não lançado
        if (progressPct >= 100 && totalLessons > 0) {
          accessState = 'completed';
        } else if (progressPct > 0) {
          accessState = 'in_progress';
        } else {
          accessState = 'enrolled';
        }
      } else if (isNotLaunched) {
        // NAO_LANCADO — não comprou e produto ainda não foi lançado
        accessState = 'coming_soon';
      } else if (isBlocked) {
        accessState = 'blocked';
      } else if (isExpired) {
        accessState = 'expired';
      } else if (hasPreview) {
        accessState = 'preview';
      } else if (hasCheckout) {
        accessState = 'locked';
      } else {
        accessState = 'available';
      }

      return {
        ...course,
        category_name: course.category_id ? categoryMap.get(course.category_id) || null : null,
        is_enrolled: isEnrolled,
        has_preview: hasPreview,
        has_checkout: hasCheckout,
        checkout_url: checkoutUrl,
        access_state: accessState,
        sales_count: salesCountMap.get(course.id) || 0,
        progress_pct: progressPct,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
      };
    };

    const courseMap = new Map(
      catalogCourses.map((course) => [course.id, enrichCourse(course)]),
    );

    const shelfCourseMap = new Map<string, ShelfCourseLink[]>();
    for (const link of shelfCourseLinks) {
      const existing = shelfCourseMap.get(link.shelf_id) || [];
      existing.push(link);
      shelfCourseMap.set(link.shelf_id, existing);
    }

    for (const links of shelfCourseMap.values()) {
      links.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    // ── Build admin-defined shelves ──
    const adminShelves = [];

    for (const shelf of shelves) {
      const links = shelfCourseMap.get(shelf.id) || [];
      const featuredMap = new Map(links.map((l) => [l.course_id, !!l.is_featured]));

      const linkedCourses = links
        .map((link) => {
          const course = courseMap.get(link.course_id);
          if (!course) return null;
          return { ...course, is_featured: featuredMap.get(link.course_id) || false };
        })
        .filter(Boolean);

      const dedupedLinkedCourses = Array.from(new Map(linkedCourses.map((course: any) => [course.id, course])).values());

      const courses = dedupedLinkedCourses.length > 0
        ? dedupedLinkedCourses
        : shelf.mode === 'auto'
          ? resolveAutoShelfCourses(shelf, publishedCourses, enrichCourse, salesCountMap, enrolledCourseIds)
          : [];

      if (courses.length > 0) {
        adminShelves.push({
          id: shelf.id,
          name: shelf.name,
          public_title: shelf.public_title || null,
          description: shelf.description || null,
          display_mode: (shelf.display_mode as any) || 'auto',
          sort_order: shelf.sort_order,
          shelf_type: 'admin' as const,
          courses,
        });
      }
    }

    const sortedAdminShelves = adminShelves.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    // REGRA 1 — Vitrine deve listar TODOS os produtos ativos do catálogo.
    // Garante que cursos publicados que não estão em nenhuma prateleira manual
    // apareçam em uma prateleira "Todos os Cursos" no final.
    const coursesInShelves = new Set<string>();
    for (const shelf of sortedAdminShelves) {
      for (const course of shelf.courses) {
        coursesInShelves.add((course as any).id);
      }
    }

    const orphanCourses = publishedCourses
      .filter((course) => !coursesInShelves.has(course.id))
      .map(enrichCourse);

    const result = [...sortedAdminShelves];
    if (orphanCourses.length > 0) {
      result.push({
        id: '__all_courses__',
        name: sortedAdminShelves.length > 0 ? 'Todos os Cursos' : 'Catálogo',
        sort_order: 9999,
        shelf_type: 'admin' as const,
        courses: orphanCourses,
      });
    }

    // ── Banner config ──
    let bannerConfig: any = null;
    try {
      const { data: bannerSetting } = await supabaseAdmin
        .from('platform_settings')
        .select('value')
        .eq('key', 'hero_banner')
        .maybeSingle();
      bannerConfig = bannerSetting?.value ?? null;
    } catch (err) {
      console.error('[getStudentShelves] banner config fetch failed:', err);
      bannerConfig = null;
    }

    // Normaliza strings vazias para null — evita criar banner sintético inválido
    const safeCourseId = typeof bannerConfig?.course_id === 'string' && bannerConfig.course_id.trim() ? bannerConfig.course_id.trim() : null;
    const safeImageUrl = typeof bannerConfig?.image_url === 'string' && bannerConfig.image_url.trim() ? bannerConfig.image_url.trim() : null;

    let featuredCourse: any = null;
    const featuredCourses: any[] = [];

    if (bannerConfig?.enabled === true) {
      if (safeCourseId) {
        const configured = courseMap.get(bannerConfig.course_id);
        if (configured) {
          featuredCourse = {
            ...configured,
            ...(bannerConfig.title ? { display_title: bannerConfig.title } : {}),
            ...(bannerConfig.subtitle ? { display_subtitle: bannerConfig.subtitle } : {}),
            ...(bannerConfig.image_url ? { banner_image_url: bannerConfig.image_url } : {}),
            banner_fit: bannerConfig.fit || 'cover',
            banner_aspect: bannerConfig.aspect || 'auto',
            banner_link_url: bannerConfig.link_url || null,
          };
        }
      } else if (safeImageUrl) {
        featuredCourse = {
          id: '__custom_banner__',
          title: bannerConfig.title || '',
          short_description: bannerConfig.subtitle || '',
          banner_image_url: safeImageUrl,
          banner_fit: bannerConfig.fit || 'cover',
          banner_aspect: bannerConfig.aspect || 'auto',
          banner_link_url: bannerConfig.link_url || null,
          access_state: 'available',
        };
      } else {
        // Fallback: pega primeiro curso com imagem da primeira prateleira não vazia
        for (const shelf of result) {
          const candidate = (shelf?.courses || []).find(
            (course: any) => course && (course.banner_image_url || course.cover_image_url),
          );
          if (candidate) {
            featuredCourse = candidate;
            break;
          }
        }
      }

      // Monta lista de até 3 destaques (carrossel rotativo)
      const seen = new Set<string>();
      if (featuredCourse) {
        featuredCourses.push(featuredCourse);
        seen.add(featuredCourse.id);
      }
      for (const shelf of result) {
        for (const course of shelf.courses || []) {
          if (featuredCourses.length >= 3) break;
          if (seen.has(course.id)) continue;
          if (course.banner_image_url || course.cover_image_url) {
            featuredCourses.push(course);
            seen.add(course.id);
          }
        }
        if (featuredCourses.length >= 3) break;
      }
    }

    const safeShelves = result.map(sanitizeShelf).filter(Boolean);
    const safeFeaturedCourse = sanitizeCourse(featuredCourse);

    return {
      shelves: safeShelves,
      promoBanners: Array.isArray(promoBanners) ? promoBanners : [],
      featuredCourse: safeFeaturedCourse,
      featuredCourses: featuredCourses.map(sanitizeCourse).filter(Boolean),
    };
    } catch (err) {
      console.error('[getStudentShelves] failed:', err);
      return {
        shelves: [],
        promoBanners: [],
        featuredCourse: null,
        featuredCourses: [],
      };
    }
  });
