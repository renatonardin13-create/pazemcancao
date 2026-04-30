-- Fix is_admin security path
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;

-- Revoke public execute from sensitive functions (using correct signatures)
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM anon;

-- Grant to authenticated
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated;

-- Update functions to check for admin role
CREATE OR REPLACE FUNCTION public.get_analytics_summary(p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  since_date timestamptz;
  result json;
  v_caller_id uuid;
BEGIN
  v_caller_id := auth.uid();
  IF NOT is_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem ver estatísticas.';
  END IF;

  since_date := now() - (p_days || ' days')::interval;

  SELECT json_build_object(
    'totalPlays', (SELECT count(*) FROM play_logs WHERE played_at >= since_date),
    'totalDownloads', (SELECT count(*) FROM download_logs WHERE downloaded_at >= since_date),
    'topPlayed', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT pl.track_id AS "trackId", tr.title, tr.cover_url AS "coverUrl", count(*) AS plays
        FROM play_logs pl
        LEFT JOIN tracks tr ON tr.id = pl.track_id
        WHERE pl.played_at >= since_date
        GROUP BY pl.track_id, tr.title, tr.cover_url
        ORDER BY count(*) DESC
        LIMIT 10
      ) t
    ),
    'topDownloaded', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT dl.track_id AS "trackId", tr.title, tr.cover_url AS "coverUrl", count(*) AS downloads
        FROM download_logs dl
        LEFT JOIN tracks tr ON tr.id = dl.track_id
        WHERE dl.downloaded_at >= since_date
        GROUP BY dl.track_id, tr.title, tr.cover_url
        ORDER BY count(*) DESC
        LIMIT 10
      ) t
    ),
    'recentDownloads', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT dl.email, tr.title AS "trackTitle", dl.downloaded_at AS "downloadedAt"
        FROM download_logs dl
        LEFT JOIN tracks tr ON tr.id = dl.track_id
        WHERE dl.downloaded_at >= since_date
        ORDER BY dl.downloaded_at DESC
        LIMIT 20
      ) t
    ),
    'userActivity', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT email,
               sum(CASE WHEN source = 'play' THEN 1 ELSE 0 END) AS plays,
               sum(CASE WHEN source = 'download' THEN 1 ELSE 0 END) AS downloads
        FROM (
          SELECT email, 'play' AS source FROM play_logs WHERE played_at >= since_date
          UNION ALL
          SELECT email, 'download' AS source FROM download_logs WHERE downloaded_at >= since_date
        ) combined
        GROUP BY email
        ORDER BY count(*) DESC
        LIMIT 20
      ) t
    ),
    'dailyPlayData', (
      SELECT coalesce(json_agg(row_to_json(t) ORDER BY t.date), '[]'::json)
      FROM (
        SELECT played_at::date::text AS date, count(*) AS plays
        FROM play_logs
        WHERE played_at >= since_date
        GROUP BY played_at::date
        ORDER BY played_at::date
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_hero_banner_metrics(p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  since_date timestamptz;
  result json;
  v_caller_id uuid;
BEGIN
  v_caller_id := auth.uid();
  IF NOT is_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  since_date := now() - (p_days || ' days')::interval;
  SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) INTO result
  FROM (
    SELECT
      b.id AS "bannerId",
      coalesce(b.title, 'Sem título') AS title,
      sum(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END)::int AS impressions,
      sum(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END)::int AS clicks,
      CASE
        WHEN sum(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END) > 0
        THEN round(
          100.0 * sum(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END)::numeric
          / sum(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END)::numeric
        , 2)
        ELSE 0
      END AS ctr
    FROM public.vitrine_hero_banners b
    LEFT JOIN public.hero_banner_events e
      ON e.banner_id = b.id AND e.created_at >= since_date
    GROUP BY b.id, b.title, b.sort_order
    ORDER BY b.sort_order ASC
  ) t;
  RETURN result;
END;
$function$;

-- Update storage policies to prevent anonymous listing on tracks
DROP POLICY IF EXISTS "Public can read tracks" ON storage.objects;
CREATE POLICY "Public can read tracks" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'tracks' AND (storage.foldername(name))[1] IS NOT NULL);
