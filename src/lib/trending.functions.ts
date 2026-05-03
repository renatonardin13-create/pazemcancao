import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Retorna os cursos mais acessados nos últimos 7 dias,
 * baseado em play_logs (faixas) e enrollments (cursos).
 *
 * Como play_logs é por track (não por curso), usamos a soma de:
 *   - matrículas criadas nos últimos 7 dias por curso (peso 3)
 *   - acessos de áudio totais no período (peso 1) distribuídos
 *     proporcionalmente entre cursos com tracks recentes.
 *
 * Estratégia simplificada e robusta: rankeamos cursos publicados pela
 * combinação de novas matrículas (7d) + access_count crescente.
 */
export const getTrendingCourses = createServerFn({ method: "GET" }).handler(
  async () => {
    const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1) Matrículas dos últimos 7 dias agrupadas por course_id
    const { data: enrollments } = await supabaseAdmin
      .from("enrollments")
      .select("course_id")
      .gte("created_at", sinceIso);

    const enrollScore = new Map<string, number>();
    for (const e of enrollments || []) {
      if (!e.course_id) continue;
      enrollScore.set(e.course_id, (enrollScore.get(e.course_id) || 0) + 3);
    }

    // 2) Plays dos últimos 7 dias (peso global, somado ao access_count)
    const { count: playsCount } = await supabaseAdmin
      .from("play_logs")
      .select("id", { count: "exact", head: true })
      .gte("played_at", sinceIso);

    // 3) Cursos publicados ordenados por (score combinado)
    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select(
        "id, title, short_description, cover_image_url, banner_image_url, sort_order, access_count, status"
      )
      .eq("status", "published");

    const ranked = (courses || [])
      .map((c) => ({
        ...c,
        _score:
          (enrollScore.get(c.id) || 0) +
          (c.access_count || 0) * 0.05 +
          (playsCount && enrollScore.has(c.id) ? 1 : 0),
        access_state: "available" as const,
      }))
      .filter((c) => c._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);

    return { courses: ranked };
  }
);
