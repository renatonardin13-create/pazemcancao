ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.get_analytics_summary(integer) SET search_path = public;
ALTER FUNCTION public.increment_course_access(uuid) SET search_path = public;
ALTER FUNCTION public.get_analytics_summary(integer, uuid) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.is_area_member(uuid) SET search_path = public;
ALTER FUNCTION public.get_hero_banner_metrics(integer) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;