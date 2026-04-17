import { useMemo } from "react";
import { ContentCard } from "@/components/ContentCard";
import { POSTER_GRID } from "@/lib/card-grid";
import { Flame, Trophy, TrendingUp, BookOpen, Video, GraduationCap, FileText } from "lucide-react";

const typeConfig: Record<string, { icon: any; gradient: string }> = {
  ebook: { icon: BookOpen, gradient: "from-blue-900/40 via-blue-950/30 to-slate-950/50" },
  video: { icon: Video, gradient: "from-purple-900/40 via-purple-950/30 to-slate-950/50" },
  free_lesson: { icon: GraduationCap, gradient: "from-emerald-900/40 via-emerald-950/30 to-slate-950/50" },
  material: { icon: FileText, gradient: "from-amber-900/40 via-amber-950/30 to-slate-950/50" },
};

const rankBadgeStyles: Record<number, string> = {
  0: "bg-gradient-to-br from-yellow-500/90 to-amber-600/90 text-white shadow-lg shadow-amber-500/20",
  1: "bg-gradient-to-br from-slate-300/90 to-slate-400/90 text-slate-800 shadow-lg shadow-slate-400/15",
  2: "bg-gradient-to-br from-amber-700/90 to-amber-800/90 text-amber-100 shadow-lg shadow-amber-700/15",
};

interface TopRankingSectionProps {
  items: any[];
  hasAccess: boolean;
  popularityMap: Record<string, { plays: number; downloads: number }>;
  progressMap?: Record<string, any>;
  lastAccessedId?: string | null;
  mode?: "all_time" | "weekly";
}

/**
 * Top 10 ranking section.
 *
 * Scoring formula:
 *   score = (plays × 2) + (downloads × 3)
 *
 * Downloads are weighted higher because they signal stronger intent.
 * Only active, card-visible items are included.
 */
export function TopRankingSection({
  items,
  hasAccess,
  popularityMap,
  progressMap = {},
  lastAccessedId = null,
  mode = "all_time",
}: TopRankingSectionProps) {
  const ranked = useMemo(() => {
    return items
      .filter((item: any) => item.is_active && item.show_as_card !== false)
      .map((item: any) => {
        const pop = popularityMap[item.id];
        const score = pop ? pop.plays * 2 + pop.downloads * 3 : 0;
        return { item, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => s.item);
  }, [items, popularityMap]);

  if (ranked.length < 3) return null;

  const title = mode === "weekly" ? "Top da semana" : "Mais acessados";
  const subtitle =
    mode === "weekly"
      ? "Os conteúdos em alta nos últimos 7 dias"
      : "Os conteúdos mais populares da plataforma";

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/10">
          {mode === "weekly" ? (
            <Flame className="h-4 w-4 text-amber-400/80" />
          ) : (
            <Trophy className="h-4 w-4 text-amber-400/80" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight flex items-center gap-2">
            🏆 {title}
            <TrendingUp className="h-3.5 w-3.5 text-amber-400/50" />
          </h2>
          <p className="text-[11px] text-muted-foreground/45 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className={POSTER_GRID}>
        {ranked.map((item: any, idx: number) => {
          const config = typeConfig[item.content_type] || typeConfig.material;
          return (
             <div
               key={`rank-${item.id}`}
               className="relative animate-in fade-in slide-in-from-bottom-2 duration-500"
               style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
             >
               {/* Rank badge */}
               <div
                 className={`absolute -top-2.5 -left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                   rankBadgeStyles[idx] ||
                   "bg-muted/60 text-foreground/60 border border-border/20"
                 }`}
               >
                 {idx + 1}
               </div>

               <ContentCard
                 item={item}
                 index={idx}
                 hasAccess={item.is_free || hasAccess}
                 gradient={config.gradient}
                 TypeIcon={config.icon}
                 progress={progressMap[item.id]}
                 isLastAccessed={item.id === lastAccessedId}
               />
             </div>
          );
        })}
      </div>
    </section>
  );
}
