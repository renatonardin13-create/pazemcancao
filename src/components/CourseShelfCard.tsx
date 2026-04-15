import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Play, Lock, Clock, Gift, BookOpenCheck } from "lucide-react";
import { resolveCourseLesson } from "@/lib/resolve-course-lesson.functions";
import { useState, useCallback, memo } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";

interface CourseShelfCardProps {
  course: any;
  badge?: React.ReactNode;
  showProgress?: boolean;
  index?: number;
  showStatusBadge?: boolean;
  subtitle?: string;
}

/**
 * Course card — uses the EXACT same visual shell as TrackCard in /louvores.
 * aspect-[9/13], same borders, overlays, hover, ambient glow, vignette.
 */
export const CourseShelfCard = memo(function CourseShelfCard({
  course,
  badge,
  showProgress = false,
  index = 0,
  showStatusBadge = false,
  subtitle,
}: CourseShelfCardProps) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const progress = course.progress_pct ?? 0;
  const hasProgress = showProgress && progress > 0;
  const isLocked = course.access_state === 'locked' || course.access_state === 'blocked' || course.access_state === 'expired';
  const hasFreePreview = course.access_state === 'preview';
  const isPaidCourse = !isLocked && (course.price > 0 || course.has_checkout) && !['enrolled', 'in_progress', 'completed'].includes(course.access_state);
  const isCompleted = progress >= 100;
  const isInProgress = progress > 0 && progress < 100;

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    const salesUrl = course.sales_page_url || course.checkout_url;
    if (isLocked && salesUrl) return;
    if (isLocked) { e.preventDefault(); return; }

    e.preventDefault();
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      const result = await resolveCourseLesson({ data: { courseId: course.id } });
      if (result.lessonId) {
        navigate({
          to: '/cursos/$courseId/aula/$lessonId',
          params: { courseId: course.id, lessonId: result.lessonId },
        });
      } else {
        navigate({ to: '/cursos/$courseId', params: { courseId: course.id } });
      }
    } catch {
      navigate({ to: '/cursos/$courseId', params: { courseId: course.id } });
    } finally {
      setIsNavigating(false);
    }
  }, [course.id, course.sales_page_url, course.checkout_url, isLocked, isNavigating, navigate]);

  const salesUrl = course.sales_page_url || course.checkout_url;
  const isExternalLink = isLocked && salesUrl;

  const metaLine = subtitle
    || (course.total_lessons > 0 ? `${course.total_lessons} aulas` : course.short_description || '');

  const cardContent = (
    <div
      className="relative animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms`, animationFillMode: 'both' }}
    >
      {/* Ambient glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gold/0 md:group-hover/card:bg-gold/[0.05] md:transition-all md:duration-700 blur-3xl pointer-events-none" />

      <div className={`relative rounded-[14px] sm:rounded-[16px] overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 ring-white/[0.04] md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:ring-gold/15 md:transition-all md:duration-500 md:group-hover/card:scale-[1.04]`}>

        {/* Image — vertical poster 9:13 (same as TrackCard) */}
        <div className={`relative aspect-[9/13] overflow-hidden ${
          isLocked ? "bg-gradient-to-br from-stone-900/40 via-zinc-950/30 to-neutral-950/50" : "bg-gradient-to-br from-sky-900/40 via-blue-950/30 to-slate-950/50"
        }`}>
          {course.cover_image_url ? (
            <OptimizedImage
              src={course.cover_image_url}
              alt={course.title}
              context="card"
              className={`w-full h-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08] ${
                isLocked ? "saturate-[0.45] brightness-[0.5]" : ""
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm transition-all duration-700 ${
                hasProgress
                  ? "bg-gold/15 border border-gold/25"
                  : "bg-white/[0.04] border border-white/[0.06] md:group-hover/card:scale-105 md:group-hover/card:bg-white/[0.07]"
              }`}>
                <BookOpen className={`h-7 w-7 transition-colors duration-500 ${
                  hasProgress ? "text-gold/70" : "text-white/25 md:group-hover/card:text-white/40"
                }`} />
              </div>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

          {/* Hover darken overlay */}
          <div className={`absolute inset-0 md:transition-all md:duration-500 ${isLocked ? "bg-black/20" : "bg-black/0 md:group-hover/card:bg-black/30"}`} />

          {/* Inner vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

          {/* Badge — top left */}
          {badge && (
            <span className="absolute top-2.5 left-2.5 z-10">{badge}</span>
          )}

          {/* Premium badge */}
          {!badge && (isLocked || isPaidCourse) && !hasFreePreview && (
            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-gold/95 to-amber-500/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm border border-gold/20">
              <Lock className="h-2.5 w-2.5" />
              Premium
            </span>
          )}

          {/* Free preview badge */}
          {!badge && hasFreePreview && !isLocked && !isPaidCourse && (
            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
              <Play className="h-2.5 w-2.5 fill-current" />
              Aula grátis
            </span>
          )}

          {/* Status badge */}
          {showStatusBadge && !badge && !isLocked && !isPaidCourse && !hasFreePreview && (
            <>
              {isCompleted && (
                <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
                  <BookOpenCheck className="h-2.5 w-2.5" /> Concluído
                </span>
              )}
              {isInProgress && !isCompleted && (
                <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
                  <Play className="h-2.5 w-2.5 fill-current" /> Em andamento
                </span>
              )}
            </>
          )}

          {/* Lock icon — top right */}
          {isLocked && (
            <div className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08]">
              <Lock className="h-3 w-3 text-white/45" />
            </div>
          )}

          {/* Category badge — top right */}
          {course.category_name && !isLocked && (
            <span className="absolute top-2.5 right-2.5 z-10 text-[9px] sm:text-[10px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/25 backdrop-blur-md border border-white/[0.06] px-2.5 py-1 text-white/35">
              {course.category_name}
            </span>
          )}

          {/* Lock overlay center */}
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2">
              <div className="flex h-14 w-14 rounded-2xl items-center justify-center backdrop-blur-sm bg-black/30 border border-white/10">
                <Lock className="h-6 w-6 text-white/50" />
              </div>
            </div>
          )}

          {/* Play button — center on hover */}
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className={`flex items-center gap-2 h-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gold/95 shadow-[0_4px_24px_rgba(0,0,0,0.4)] scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${isNavigating ? 'animate-pulse' : ''}`}>
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gold-foreground fill-gold-foreground" />
              </div>
            </div>
          )}

          {/* Title + meta — bottom */}
          <div className="absolute inset-x-0 bottom-0 px-3.5 sm:px-4 pb-4 sm:pb-5 z-10">
            <h3 className={`text-sm sm:text-[15px] font-bold line-clamp-2 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight ${
              isLocked ? "text-white/60" : "text-white"
            }`}>
              {course.title}
            </h3>

            <p className={`text-[10px] sm:text-[11px] mt-1.5 line-clamp-1 leading-relaxed ${
              isLocked ? "text-white/25" : "text-white/35"
            }`}>
              {metaLine}
            </p>

            <div className="flex items-center gap-3 mt-2 opacity-80 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-400">
              {isLocked && (
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55">
                  <Lock className="inline h-2.5 w-2.5 mr-0.5" />
                  Bloqueado
                </span>
              )}
              {!isLocked && hasProgress && (
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55 tabular-nums">
                  {progress}%
                </span>
              )}
            </div>
          </div>

          {/* Progress bar — bottom edge */}
          {hasProgress && !isLocked && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/[0.06] z-20">
              <div
                className={`h-full rounded-r-full md:transition-all md:duration-200 ease-linear ${isCompleted ? "bg-emerald-400" : "bg-gold"}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isExternalLink) {
    return (
      <a
        href={salesUrl!}
        target="_blank"
        rel="noopener noreferrer"
        className="group/card relative block cursor-pointer"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e as any); } }}
      className={`group/card relative block cursor-pointer ${isNavigating ? 'pointer-events-none' : ''}`}
    >
      {cardContent}
    </div>
  );
});
