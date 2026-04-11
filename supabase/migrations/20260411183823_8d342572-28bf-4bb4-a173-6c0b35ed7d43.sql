
-- Create a function to get aggregated analytics data efficiently
CREATE OR REPLACE FUNCTION public.get_analytics_summary(p_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  since_date timestamptz;
  result json;
BEGIN
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
$$;
