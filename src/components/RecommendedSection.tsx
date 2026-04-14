import { useMemo } from "react";
import { ContentCard } from "@/components/ContentCard";
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
}

export function RecommendedSection({ items, hasAccess, viewedIds, downloadedIds, progressMap = {} }: RecommendedSectionProps) {
  const recommendations = useMemo(() => {
    const consumed = new Set([...viewedIds, ...downloadedIds]);
    const completedIds = new Set(
      Object.entries(progressMap)
        .filter(([, p]) => p.completed_at)
        .map(([id]) => id)
    );

    // Score each item
    const scored = items
      .filter((item) => item.show_as_card !== false)
      .map((item) => {
        let score = 0;

        // Strongly prefer unseen content
        if (!consumed.has(item.id) && !progressMap[item.id]?.viewed_at) score += 10;

        // Started but not completed — "continue" boost
        if (progressMap[item.id]?.viewed_at && !progressMap[item.id]?.completed_at) score += 8;

        // Penalize already completed
        if (completedIds.has(item.id)) score -= 5;

        // Prefer unlocked content
        if (item.unlocked) score += 5;

        // Prefer free content (accessible to everyone)
        if (item.is_free) score += 2;

        // Prefer content with badge (featured)
        if (item.badge_text) score += 3;

        // Prefer content in journey groups (curated)
        if (item.journey_group) score += 1;

        // Slight boost for lower sort_order (admin priority)
        score += Math.max(0, 10 - (item.sort_order || 0)) * 0.1;

        return { item, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.item);

    return scored;
  }, [items, viewedIds, downloadedIds, progressMap]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
