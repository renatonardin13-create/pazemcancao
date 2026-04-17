import { useMemo } from "react";
import { ContentCard } from "@/components/ContentCard";
import { POSTER_GRID } from "@/lib/card-grid";
import { Sparkles, BookOpen, Video, GraduationCap, FileText } from "lucide-react";

const typeConfig: Record<string, { icon: any; gradient: string }> = {
  ebook: { icon: BookOpen, gradient: "from-blue-900/40 via-blue-950/30 to-slate-950/50" },
  video: { icon: Video, gradient: "from-purple-900/40 via-purple-950/30 to-slate-950/50" },
  free_lesson: { icon: GraduationCap, gradient: "from-emerald-900/40 via-emerald-950/30 to-slate-950/50" },
  material: { icon: FileText, gradient: "from-amber-900/40 via-amber-950/30 to-slate-950/50" },
};

interface RecommendedSectionProps {
  items: any[];
  hasAccess: boolean;
  viewedIds: string[];
  downloadedIds: string[];
  progressMap?: Record<string, any>;
  popularityMap?: Record<string, { plays: number; downloads: number }>;
}

/**
 * Intelligent recommendation engine — scores each content item using
 * multiple signals and returns the top picks.
 *
 * Signals used:
 *  1. Freshness        — unseen content gets a strong boost
 *  2. Continuity       — started-but-not-completed content ("continue watching")
 *  3. Category affinity — items in the same category as recently consumed content
 *  4. Popularity       — globally popular items (play + download count)
 *  5. Recency          — recently published items
 *  6. Curation         — admin-featured / journey / badge items
 *  7. Accessibility    — unlocked / free content preferred
 *
 * Structure is ready for future AI-driven scoring (e.g. embedding similarity,
 * collaborative filtering) — just add new score components below.
 */
function computeRecommendations(
  items: any[],
  viewedIds: string[],
  downloadedIds: string[],
  progressMap: Record<string, any>,
  popularityMap: Record<string, { plays: number; downloads: number }>,
): any[] {
  const consumed = new Set([...viewedIds, ...downloadedIds]);
  const completedIds = new Set(
    Object.entries(progressMap)
      .filter(([, p]) => p.completed_at)
      .map(([id]) => id),
  );

  // Determine user's preferred categories from consumed content
  const categoryFreq: Record<string, number> = {};
  for (const item of items) {
    if (consumed.has(item.id) || progressMap[item.id]?.viewed_at) {
      const cat = item.display_category || item.content_type || "other";
      categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
    }
  }

  // Compute max popularity for normalization
  let maxPop = 1;
  for (const v of Object.values(popularityMap)) {
    const total = v.plays + v.downloads;
    if (total > maxPop) maxPop = total;
  }

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  const scored = items
    .filter((item) => item.show_as_card !== false)
    .map((item) => {
      let score = 0;

      // ── Signal 1: Freshness (unseen content) ──
      const isConsumed = consumed.has(item.id) || !!progressMap[item.id]?.viewed_at;
      if (!isConsumed) score += 12;

      // ── Signal 2: Continuity (started but not completed) ──
      if (progressMap[item.id]?.viewed_at && !progressMap[item.id]?.completed_at) score += 10;

      // ── Signal 3: Category affinity ──
      const cat = item.display_category || item.content_type || "other";
      if (categoryFreq[cat]) {
        score += Math.min(categoryFreq[cat] * 2, 8); // cap at 8
      }

      // ── Signal 4: Popularity (normalized 0-6) ──
      const pop = popularityMap[item.id];
      if (pop) {
        const normalized = (pop.plays + pop.downloads) / maxPop;
        score += normalized * 6;
      }

      // ── Signal 5: Recency (published in last 30 days) ──
      const age = now - new Date(item.created_at).getTime();
      if (age < thirtyDays) {
        score += 4 * (1 - age / thirtyDays); // linear decay
      }

      // ── Signal 6: Curation ──
      if (item.badge_text) score += 3;
      if (item.is_featured) score += 2;
      if (item.journey_group) score += 1;

      // ── Signal 7: Accessibility ──
      if (item.unlocked) score += 5;
      if (item.is_free) score += 2;

      // ── Penalties ──
      if (completedIds.has(item.id)) score -= 8;

      // Admin priority (lower sort_order = higher priority)
      score += Math.max(0, 10 - (item.sort_order || 0)) * 0.1;

      return { item, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.item);

  return scored;
}

export function RecommendedSection({
  items,
  hasAccess,
  viewedIds,
  downloadedIds,
  progressMap = {},
  popularityMap = {},
}: RecommendedSectionProps) {
  const recommendations = useMemo(
    () => computeRecommendations(items, viewedIds, downloadedIds, progressMap, popularityMap),
    [items, viewedIds, downloadedIds, progressMap, popularityMap],
  );

  if (recommendations.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary/60" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
            ✨ Recomendado para você
          </h2>
          <p className="text-xs text-muted-foreground/60">
            Continue sua caminhada espiritual
          </p>
        </div>
      </div>
      <div className={POSTER_GRID}>
        {recommendations.map((item: any, idx: number) => {
          const config = typeConfig[item.content_type] || typeConfig.material;
          return (
            <ContentCard
              key={`rec-${item.id}`}
              item={item}
              index={idx}
              hasAccess={item.is_free || hasAccess}
              gradient={config.gradient}
              TypeIcon={config.icon}
            />
          );
        })}
      </div>
    </section>
  );
}
