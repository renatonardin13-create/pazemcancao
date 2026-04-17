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
};

type ShelfCourseLink = {
  shelf_id: string;
  course_id: string;
  sort_order: number;
};

type CourseRecord = {
  id: string;
  title: string;
  short_description: string | null;
  cover_image_url: string | null;
  banner_image_url: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  price: number;
};

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
    const { supabase, userId } = context;

    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();

    const { data: adminRole, error: adminRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (adminRoleError) throw new Error(adminRoleError.message);

    const isAdmin = !!adminRole || email === 'renatonardin13@gmail.com';

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
        .select('shelf_id, course_id, sort_order')
        .in('shelf_id', shelfIds)
        .order('sort_order', { ascending: true });

      if (shelfCoursesErr) throw new Error(shelfCoursesErr.message);
      shelfCourseLinks = (shelfCourseRows || []) as ShelfCourseLink[];
    }

    const linkedCourseIds = Array.from(new Set(shelfCourseLinks.map((link) => link.course_id)));
    const hasAutoShelves = shelves.some((shelf) => shelf.mode === 'auto');

    // Always fetch all published courses to build smart shelves
    let publishedCourses: CourseRecord[] = [];
    {
      const { data: allCourses, error: coursesErr } = await supabaseAdmin
        .from('courses')
        .select('id, title, short_description, cover_image_url, banner_image_url, status, sort_order, created_at, price')
        .eq('status', 'published')
        .order('sort_order', { ascending: true });

      if (coursesErr) throw new Error(coursesErr.message);
      publishedCourses = (allCourses || []) as CourseRecord[];
    }

    const publishedCourseIds = publishedCourses.map((course) => course.id);

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
      const isEnrolled = enrolledCourseIds.has(course.id) || isAdmin;
      const isBlocked = blockedEnrollmentIds.has(course.id);
      const isExpired = expiredEnrollmentIds.has(course.id);
      const hasPreview = previewCourseIds.has(course.id);
      const checkoutUrl = integrationMap.get(course.id) || null;
      const hasCheckout = !!checkoutUrl;

      const totalLessons = lessonCountMap.get(course.id) || 0;
      const completedLessons = completedLessonsMap.get(course.id) || 0;
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      let accessState: string;
      if (isEnrolled) {
        if (progressPct >= 100 && totalLessons > 0) {
          accessState = 'completed';
        } else if (progressPct > 0) {
          accessState = 'in_progress';
        } else {
          accessState = 'enrolled';
        }
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
      publishedCourses.map((course) => [course.id, enrichCourse(course)]),
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
      const linkedCourses = (shelfCourseMap.get(shelf.id) || [])
        .map((link) => courseMap.get(link.course_id))
        .filter(Boolean);

      const courses = linkedCourses.length > 0
        ? linkedCourses
        : shelf.mode === 'auto'
          ? resolveAutoShelfCourses(shelf, publishedCourses, enrichCourse, salesCountMap, enrolledCourseIds)
          : [];

      if (courses.length > 0) {
        adminShelves.push({
          id: shelf.id,
          name: shelf.name,
          sort_order: shelf.sort_order,
          shelf_type: 'admin' as const,
          courses,
        });
      }
    }

    // ── Build smart shelves ──

    // 1. "Continue sua experiência" — in-progress courses sorted by last activity
    const continueShelf: any[] = [];
    const courseProgressMap = new Map<string, { lastAccess: string }>();
    for (const p of userProgressData) {
      if (!courseProgressMap.has(p.course_id)) {
        courseProgressMap.set(p.course_id, { lastAccess: p.updated_at });
      }
    }
    for (const [courseId, info] of courseProgressMap) {
      const enriched = courseMap.get(courseId);
      if (enriched && enriched.access_state === 'in_progress') {
        continueShelf.push({ ...enriched, last_accessed_at: info.lastAccess });
      }
    }
    continueShelf.sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime());

    // 2. "Disponível para você" — locked courses with checkout URL
    const availableForYou = Array.from(courseMap.values())
      .filter((c: any) => ['locked', 'blocked', 'expired'].includes(c.access_state) && c.checkout_url)
      .slice(0, 20);

    // 3. "Em breve" — courses with future launch_date (need to fetch)
    let comingSoonCourses: any[] = [];
    {
      const { data: upcomingCourses } = await supabaseAdmin
        .from('courses')
        .select('id, title, short_description, cover_image_url, banner_image_url, status, sort_order, created_at, price, launch_date')
        .eq('status', 'draft')
        .not('launch_date', 'is', null)
        .gt('launch_date', new Date().toISOString().split('T')[0])
        .order('launch_date', { ascending: true })
        .limit(20);

      if (upcomingCourses && upcomingCourses.length > 0) {
        const now = new Date();
        comingSoonCourses = upcomingCourses.map((c: any) => {
          const launchDate = new Date(c.launch_date);
          const diffDays = Math.ceil((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return {
            ...c,
            access_state: 'coming_soon',
            coming_soon_days: diffDays,
            badge_text: diffDays <= 7 ? `Em ${diffDays} dia${diffDays !== 1 ? 's' : ''}` : 'Em breve',
            total_lessons: 0,
            progress_pct: 0,
          };
        });
      }
    }

    // ── Assemble final ordered result ──
    const result: any[] = [];

    // Smart shelf: Continue
    if (continueShelf.length > 0) {
      result.push({
        id: '__continue__',
        name: 'Continue sua experiência',
        sort_order: -100,
        shelf_type: 'smart',
        courses: continueShelf.slice(0, 15),
      });
    }

    // Admin shelves in their original order
    for (const shelf of adminShelves) {
      result.push(shelf);
    }

    // Smart shelf: Disponível para você
    if (availableForYou.length > 0) {
      result.push({
        id: '__available__',
        name: 'Disponível para você',
        sort_order: 900,
        shelf_type: 'smart',
        courses: availableForYou,
      });
    }

    // Smart shelf: Em breve
    if (comingSoonCourses.length > 0) {
      result.push({
        id: '__coming_soon__',
        name: 'Em breve',
        sort_order: 950,
        shelf_type: 'smart',
        courses: comingSoonCourses,
      });
    }

    // ── Banner config ──
    const { data: bannerSetting, error: bannerError } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'hero_banner')
      .maybeSingle();

    if (bannerError) throw new Error(bannerError.message);

    const bannerConfig = bannerSetting?.value as any;
    let featuredCourse: any = null;

    if (bannerConfig?.enabled === true) {
      if (bannerConfig?.course_id) {
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
      } else if (bannerConfig?.image_url) {
        featuredCourse = {
          id: '__custom_banner__',
          title: bannerConfig.title || '',
          short_description: bannerConfig.subtitle || '',
          banner_image_url: bannerConfig.image_url,
          banner_fit: bannerConfig.fit || 'cover',
          banner_aspect: bannerConfig.aspect || 'auto',
          banner_link_url: bannerConfig.link_url || null,
          access_state: 'available',
        };
      } else {
        featuredCourse = result.length > 0
          ? result[0].courses.find((course: any) => course.banner_image_url || course.cover_image_url) || null
          : null;
      }
    }

    return {
      shelves: result,
      promoBanners: promoBanners || [],
      featuredCourse,
    };
  });
