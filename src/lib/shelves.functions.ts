import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

// ── Get shelves, promo banners, and banner config for the student area ──
export const getStudentShelves = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Get user email
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();

    // Check if admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!adminRole || email === 'renatonardin13@gmail.com';

    // Get active shelves
    const { data: shelves, error: shelvesErr } = await supabase
      .from('shelves')
      .select('id, name, mode, auto_criteria, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (shelvesErr) throw new Error(shelvesErr.message);

    // Get active promo banners
    const { data: promoBanners } = await supabase
      .from('promo_banners')
      .select('id, title, image_url, link_url, position_after_shelf, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Get user enrollments with status and expiration info
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id, status, expires_at')
      .eq('user_id', userId);

    // Active enrollments: status = active AND not expired
    const activeEnrollmentIds = new Set<string>();
    const blockedEnrollmentIds = new Set<string>();
    const expiredEnrollmentIds = new Set<string>();

    for (const e of enrollments || []) {
      const isExpired = e.expires_at && new Date(e.expires_at) < new Date();
      if (e.status === 'active' && !isExpired) {
        activeEnrollmentIds.add(e.course_id);
      } else if (e.status === 'blocked') {
        blockedEnrollmentIds.add(e.course_id);
      } else if (isExpired || e.status === 'expired') {
        expiredEnrollmentIds.add(e.course_id);
      }
    }

    const enrolledCourseIds = activeEnrollmentIds;

    // Get all published courses
    const { data: allCourses } = await supabase
      .from('courses')
      .select('id, title, short_description, cover_image_url, banner_image_url, status, sort_order, created_at')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    const publishedCourseIds = (allCourses || []).map((c: any) => c.id);

    // Check which published courses have at least 1 lesson (eligible for consumption)
    const { data: lessonCounts } = await supabaseAdmin
      .from('lessons')
      .select('course_id')
      .in('course_id', publishedCourseIds.length > 0 ? publishedCourseIds : ['__none__']);

    const coursesWithLessons = new Set((lessonCounts || []).map((l: any) => l.course_id));

    // Only show courses that have at least 1 lesson
    const publishedCourses = (allCourses || []).filter((c: any) => coursesWithLessons.has(c.id));

    // Courses with free preview lessons
    const { data: previewLessons } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('is_free_preview', true);

    const previewCourseIds = new Set((previewLessons || []).map((lesson: any) => lesson.course_id));

    // Courses with sales strategy configured
    const { data: integrations } = await supabaseAdmin
      .from('course_integrations')
      .select('course_id, is_enabled, checkout_url')
      .eq('is_enabled', true);

    const integrationMap = new Map(
      (integrations || [])
        .filter((item: any) => !!item.checkout_url)
        .map((item: any) => [item.course_id, item.checkout_url])
    );

    // Best-selling criteria based on released/enrolled students
    const { data: allActiveEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('status', 'active');

    const salesCountMap = new Map<string, number>();
    for (const enrollment of allActiveEnrollments || []) {
      const current = salesCountMap.get(enrollment.course_id) || 0;
      salesCountMap.set(enrollment.course_id, current + 1);
    }

    // Get lesson counts per course for progress calculation
    const lessonCountMap = new Map<string, number>();
    for (const l of lessonCounts || []) {
      lessonCountMap.set(l.course_id, (lessonCountMap.get(l.course_id) || 0) + 1);
    }

    // Get user's lesson progress for enrolled courses
    const enrolledIds = Array.from(activeEnrollmentIds);
    const completedLessonsMap = new Map<string, number>();
    if (enrolledIds.length > 0) {
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('course_id, completed')
        .eq('user_id', userId)
        .in('course_id', enrolledIds);

      for (const p of progressData || []) {
        if (p.completed) {
          completedLessonsMap.set(p.course_id, (completedLessonsMap.get(p.course_id) || 0) + 1);
        }
      }
    }

    const enrichCourse = (course: any) => {
      const isEnrolled = enrolledCourseIds.has(course.id) || isAdmin;
      const isBlocked = blockedEnrollmentIds.has(course.id);
      const isExpired = expiredEnrollmentIds.has(course.id);
      const hasPreview = previewCourseIds.has(course.id);
      const checkoutUrl = integrationMap.get(course.id) || null;
      const hasCheckout = !!checkoutUrl;

      // Progress calculation
      const totalLessons = lessonCountMap.get(course.id) || 0;
      const completedLessons = completedLessonsMap.get(course.id) || 0;
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // Determine access state
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

    const courseMap = new Map(publishedCourses.map((course: any) => [course.id, enrichCourse(course)]));

    // For each shelf, resolve courses — with CROSS-SHELF dedup
    const result = [];
    const globalSeenCourseIds = new Set<string>();

    for (const shelf of shelves || []) {
      let courses: any[] = [];

      if (shelf.mode === 'manual') {
        const { data: shelfCourses } = await supabase
          .from('shelf_courses')
          .select('course_id, sort_order')
          .eq('shelf_id', shelf.id)
          .order('sort_order', { ascending: true });

        courses = (shelfCourses || [])
          .map((sc: any) => courseMap.get(sc.course_id))
          .filter(Boolean);
      } else {
        switch (shelf.auto_criteria) {
          case 'recent':
            courses = [...publishedCourses].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 20).map(enrichCourse);
            break;
          case 'best_selling':
            courses = [...publishedCourses]
              .sort((a: any, b: any) => {
                const salesDiff = (salesCountMap.get(b.id) || 0) - (salesCountMap.get(a.id) || 0);
                if (salesDiff !== 0) return salesDiff;
                return a.sort_order - b.sort_order;
              })
              .slice(0, 20).map(enrichCourse);
            break;
          case 'featured':
            courses = publishedCourses.filter((c: any) => c.sort_order <= 5).slice(0, 20).map(enrichCourse);
            break;
          case 'enrolled':
            courses = publishedCourses.filter((c: any) => enrolledCourseIds.has(c.id)).map(enrichCourse);
            break;
          default:
            courses = publishedCourses.slice(0, 20).map(enrichCourse);
        }
      }

      // Deduplicate within shelf AND across shelves
      courses = courses.filter((c: any) => {
        if (globalSeenCourseIds.has(c.id)) return false;
        globalSeenCourseIds.add(c.id);
        return true;
      });

      if (courses.length > 0) {
        result.push({
          id: shelf.id,
          name: shelf.name,
          sort_order: shelf.sort_order,
          courses,
        });
      }
    }

    // Load hero banner config from platform_settings
    const { data: bannerSetting } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'hero_banner')
      .maybeSingle();

    const bannerConfig = bannerSetting?.value as any;
    let featuredCourse: any = null;

    if (bannerConfig?.enabled !== false) {
      if (bannerConfig?.course_id) {
        // Use the configured course
        const configured = courseMap.get(bannerConfig.course_id);
        if (configured) {
          featuredCourse = {
            ...configured,
            // Override with admin-configured values if present
            ...(bannerConfig.title ? { display_title: bannerConfig.title } : {}),
            ...(bannerConfig.subtitle ? { display_subtitle: bannerConfig.subtitle } : {}),
            ...(bannerConfig.image_url ? { banner_image_url: bannerConfig.image_url } : {}),
            banner_fit: bannerConfig.fit || 'cover',
            banner_aspect: bannerConfig.aspect || 'auto',
          };
        }
      } else if (bannerConfig?.image_url) {
        // Custom image without course link
        featuredCourse = {
          id: '__custom_banner__',
          title: bannerConfig.title || '',
          short_description: bannerConfig.subtitle || '',
          banner_image_url: bannerConfig.image_url,
          banner_fit: bannerConfig.fit || 'cover',
          banner_aspect: bannerConfig.aspect || 'auto',
          access_state: 'available',
        };
      } else {
        // Fallback: first shelf course with an image
        featuredCourse = result.length > 0
          ? result[0].courses.find(
              (c: any) => c.banner_image_url || c.cover_image_url
            ) || null
          : null;
      }
    }

    return {
      shelves: result,
      promoBanners: promoBanners || [],
      featuredCourse,
    };
  });
