import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Play, Lock, BookOpenCheck, ShoppingCart } from "lucide-react";
import { resolveCourseLesson } from "@/lib/resolve-course-lesson.functions";
import { useState, useCallback, memo } from "react";
import { PosterCard } from "@/components/PosterCard";

interface CourseShelfCardProps {
  course: any;
  badge?: React.ReactNode;
  showProgress?: boolean;
  index?: number;
  showStatusBadge?: boolean;
  subtitle?: string;
}

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
        navigate({ to: '/cursos/$courseId/aula/$lessonId', params: { courseId: course.id, lessonId: result.lessonId } });
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

  const metaLine = subtitle || (course.total_lessons > 0 ? `${course.total_lessons} aulas` : course.short_description || '');

  const fallback = (
    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm transition-all duration-700 ${
      hasProgress ? "bg-gold/15 border border-gold/25" : "bg-white/[0.04] border border-white/[0.06] md:group-hover/card:scale-105 md:group-hover/card:bg-white/[0.07]"
    }`}>
      <BookOpen className={`h-7 w-7 transition-colors duration-500 ${hasProgress ? "text-gold/70" : "text-white/25 md:group-hover/card:text-white/40"}`} />
    </div>
  );

  const badgeTopLeft = badge ? badge
    : (isLocked || isPaidCourse) && !hasFreePreview ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-gold/95 to-amber-500/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm border border-gold/20">
        <Lock className="h-2.5 w-2.5" />
        Premium
      </span>
    ) : hasFreePreview && !isLocked && !isPaidCourse ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
        <Play className="h-2.5 w-2.5 fill-current" />
        Aula grátis
      </span>
    ) : showStatusBadge && !isLocked && !isPaidCourse && !hasFreePreview ? (
      isCompleted ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
          <BookOpenCheck className="h-2.5 w-2.5" /> Concluído
        </span>
      ) : isInProgress ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
          <Play className="h-2.5 w-2.5 fill-current" /> Em andamento
        </span>
      ) : undefined
    ) : undefined;

  const badgeTopRight = isLocked ? (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08]">
      <Lock className="h-3 w-3 text-white/45" />
    </div>
  ) : course.category_name ? (
    <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/25 backdrop-blur-md border border-white/[0.06] px-2.5 py-1 text-white/35">
      {course.category_name}
    </span>
  ) : undefined;

  const overlay = isLocked ? (
    <div className="h-full bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2.5">
      <div className="relative">
        <div className="absolute -inset-3 rounded-full bg-gold/10 blur-xl animate-pulse" />
        <div className="relative flex h-14 w-14 rounded-2xl items-center justify-center bg-gradient-to-br from-gold/20 to-amber-600/10 border border-gold/25 shadow-lg shadow-gold/10">
          <Lock className="h-6 w-6 text-gold/70" />
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/60">
        Conteúdo Premium
      </span>
      {salesUrl && (
        <span className="text-[9px] font-medium text-gold/35 flex items-center gap-1 mt-0.5">
          <ShoppingCart className="h-2.5 w-2.5" />
          Toque para desbloquear
        </span>
      )}
    </div>
  ) : undefined;

  const centerAction = !isLocked ? (
    <div className={`flex items-center gap-2 h-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gold/95 shadow-[0_4px_24px_rgba(0,0,0,0.4)] scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${isNavigating ? 'animate-pulse' : ''}`}>
      <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gold-foreground fill-gold-foreground" />
    </div>
  ) : undefined;

  const meta = (
    <>
      {isLocked && (
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55">
          <Lock className="inline h-2.5 w-2.5 mr-0.5" />
          Premium
        </span>
      )}
      {!isLocked && hasProgress && (
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55 tabular-nums">
          {progress}%
        </span>
      )}
    </>
  );

  const card = (
    <PosterCard
      cover={course.cover_image_url || null}
      coverAlt={course.title}
      fallback={fallback}
      gradientClass={isLocked ? "from-stone-900/40 via-zinc-950/30 to-neutral-950/50" : "from-sky-900/40 via-blue-950/30 to-slate-950/50"}
      badgeTopLeft={badgeTopLeft}
      badgeTopRight={badgeTopRight}
      overlay={overlay}
      centerAction={centerAction}
      title={course.title}
      subtitle={metaLine}
      meta={meta}
      progress={hasProgress && !isLocked ? progress : null}
      progressColorClass={isCompleted ? "bg-emerald-400" : "bg-gold"}
      locked={isLocked}
      index={index}
    />
  );

  if (isExternalLink) {
    return (
      <a href={salesUrl!} target="_blank" rel="noopener noreferrer" className="group/card relative block cursor-pointer">
        {card}
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
      {card}
    </div>
  );
});
