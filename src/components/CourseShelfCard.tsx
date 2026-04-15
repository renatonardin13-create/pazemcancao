import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Play, Pause, Lock, Clock, Gift, BookOpenCheck } from "lucide-react";
import { resolveCourseLesson } from "@/lib/resolve-course-lesson.functions";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface CourseShelfCardProps {
  course: any;
  badge?: React.ReactNode;
  showProgress?: boolean;
  ctaLabel?: string;
  showDescription?: boolean;
  showCta?: boolean;
  index?: number;
  /** Show status badge (Concluído / Em andamento) */
  showStatusBadge?: boolean;
  /** Override subtitle line */
  subtitle?: string;
}

/**
 * Course card — uses the EXACT same visual shell as TrackCard in /louvores.
 * Fixed height, cover top, info section bottom, same borders/overlay/hover.
 */
export function CourseShelfCard({
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

  // Meta line
  const metaLine = subtitle
    || (course.total_lessons > 0 ? `${course.total_lessons} aulas` : course.short_description || '');

  const cardContent = (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className={`relative rounded-2xl border transition-all duration-500 overflow-hidden h-[300px] sm:h-[320px] flex flex-col ${
        isLocked
          ? "border-border/25 shadow-[0_4px_30px_-10px] shadow-black/20 opacity-70 grayscale-[30%]"
          : hasProgress
            ? "border-gold/15 shadow-[0_4px_30px_-10px] shadow-gold/10"
            : "border-border/20 shadow-[0_4px_30px_-10px] shadow-black/20 hover:border-gold/15"
      } bg-card/20`}
    >
      {/* Cover area — fixed height, same as TrackCard */}
      <div className="relative h-[200px] sm:h-[220px] w-full bg-gradient-to-br from-sky-900/40 via-blue-950/30 to-slate-950/50 overflow-hidden shrink-0">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              isLocked ? "brightness-50" : "group-hover:scale-110"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur-sm bg-white/[0.04] border border-white/[0.06] group-hover:scale-105 group-hover:bg-white/[0.07] transition-all duration-700">
              <BookOpen className="h-6 w-6 text-white/25 group-hover:text-white/40 transition-colors duration-500" />
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isLocked
            ? "bg-gradient-to-t from-black/80 via-black/40 to-black/20"
            : "bg-gradient-to-t from-black/60 via-transparent to-transparent"
        }`} />

        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2">
            <div className="flex h-14 w-14 rounded-2xl items-center justify-center backdrop-blur-sm bg-black/30 border border-white/10">
              <Lock className="h-6 w-6 text-white/50" />
            </div>
          </div>
        )}

        {/* Badge — top left */}
        {badge && (
          <span className="absolute top-3 left-3 z-10">{badge}</span>
        )}

        {/* Premium badge */}
        {!badge && (isLocked || isPaidCourse) && !hasFreePreview && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-gold/95 to-amber-500/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm border border-gold/20">
            <Lock className="h-2.5 w-2.5" />
            Premium
          </span>
        )}

        {/* Free preview badge */}
        {!badge && hasFreePreview && !isLocked && !isPaidCourse && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
            <Play className="h-2.5 w-2.5 fill-current" />
            Aula grátis
          </span>
        )}

        {/* Status badge — top left (when showStatusBadge) */}
        {showStatusBadge && !badge && !isLocked && !isPaidCourse && !hasFreePreview && (
          <>
            {isCompleted && (
              <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
                <BookOpenCheck className="h-2.5 w-2.5" /> Concluído
              </span>
            )}
            {isInProgress && !isCompleted && (
              <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
                <Play className="h-2.5 w-2.5 fill-current" /> Em andamento
              </span>
            )}
          </>
        )}

        {/* Category badge — top right */}
        {course.category_name && !isLocked && (
          <span className="absolute top-3 right-3 text-[10px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/30 backdrop-blur-sm border border-white/[0.08] px-2 py-0.5 text-white/40 z-10">
            {course.category_name}
          </span>
        )}

        {/* Lock icon — top right */}
        {isLocked && (
          <div className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08]">
            <Lock className="h-3 w-3 text-white/45" />
          </div>
        )}

        {/* Play button overlay on hover */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-10">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gold/80 text-background shadow-xl shadow-gold/20 hover:bg-gold hover:scale-110 transition-all duration-300 ${isNavigating ? 'animate-pulse' : ''}`}>
              <Play className="h-5 w-5 ml-0.5" />
            </div>
          </div>
        )}

        {/* Progress bar at bottom of cover */}
        {hasProgress && !isLocked && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 z-10">
            <div
              className={`h-full bg-gradient-to-r from-gold/60 to-gold/90 transition-all duration-700 ${isCompleted ? "bg-emerald-400" : ""}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Info section — fixed height, same as TrackCard */}
      <div className="p-3.5 flex flex-col flex-1 min-h-0">
        <h3 className={`font-display text-[13px] font-bold tracking-tight leading-snug line-clamp-2 transition-colors duration-500 ${
          isLocked ? "text-muted-foreground/70" : hasProgress ? "text-gold/70" : "text-foreground/85 group-hover:text-foreground"
        }`}>
          {course.title}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-1.5">
          <div className="flex items-center gap-2">
            <p className="text-xs tracking-[0.1em] font-medium text-muted-foreground/60 line-clamp-1">
              {metaLine}
            </p>
            {isLocked && (
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full text-destructive/40 bg-destructive/8">
                Bloqueado
              </span>
            )}
            {!isLocked && hasProgress && (
              <span className="text-[10px] font-semibold tracking-wider uppercase text-gold/70 bg-gold/8 px-1.5 py-0.5 rounded-full tabular-nums">
                {progress}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isExternalLink) {
    return (
      <a
        href={salesUrl!}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block cursor-pointer"
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
      className={`group relative block cursor-pointer ${isNavigating ? 'pointer-events-none' : ''}`}
    >
      {cardContent}
    </div>
  );
}
