import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

// ── Get shelves for the student area (respecting enrollment) ──
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

    const isAdmin = !!adminRole;

    // Get active shelves
    const { data: shelves, error: shelvesErr } = await supabase
      .from('shelves')
      .select('id, name, mode, auto_criteria, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (shelvesErr) throw new Error(shelvesErr.message);

    // Get user enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .eq('status', 'active');

    const enrolledCourseIds = new Set(
      (enrollments || []).map((e: any) => e.course_id)
    );

    // Get all published courses
    const { data: allCourses } = await supabase
      .from('courses')
      .select('id, title, short_description, cover_image_url, status, sort_order, created_at')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    const publishedCourses = allCourses || [];

    // For each shelf, resolve courses
    const result = [];

    for (const shelf of shelves || []) {
      let courses: any[] = [];

      if (shelf.mode === 'manual') {
        // Get manually linked courses
        const { data: shelfCourses } = await supabase
          .from('shelf_courses')
          .select('course_id, sort_order, courses(id, title, short_description, cover_image_url, status)')
          .eq('shelf_id', shelf.id)
          .order('sort_order', { ascending: true });

        courses = (shelfCourses || [])
          .filter((sc: any) => sc.courses?.status === 'published')
          .map((sc: any) => sc.courses);
      } else {
        // Auto mode
        switch (shelf.auto_criteria) {
          case 'recent':
            courses = [...publishedCourses].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 20);
            break;
          case 'featured':
            courses = publishedCourses.filter((c: any) => c.sort_order <= 5).slice(0, 20);
            break;
          case 'enrolled':
            courses = publishedCourses.filter((c: any) => enrolledCourseIds.has(c.id));
            break;
          default:
            courses = publishedCourses.slice(0, 20);
        }
      }

      // If not admin, filter to only enrolled courses (unless shelf is 'all' type showing previews)
      if (!isAdmin) {
        courses = courses.map((c: any) => ({
          ...c,
          is_enrolled: enrolledCourseIds.has(c.id),
        }));
      } else {
        courses = courses.map((c: any) => ({
          ...c,
          is_enrolled: true,
        }));
      }

      if (courses.length > 0) {
        result.push({
          id: shelf.id,
          name: shelf.name,
          courses,
        });
      }
    }

    return { shelves: result };
  });
