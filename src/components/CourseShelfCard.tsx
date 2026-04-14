import { Link } from "@tanstack/react-router";
import { BookOpen, Play, Lock, Clock, BookOpenCheck } from "lucide-react";

interface CourseShelfCardProps {
  course: any;
  badge?: React.ReactNode;
  showProgress?: boolean;
  ctaLabel?: string;
  showDescription?: boolean;
  showCta?: boolean;
}

/**
 * Premium vertical poster card — 2:3 aspect with cinematic hover.
 */
export function CourseShelfCard({
  course,
  badge,
  showProgress = false,
}: CourseShelfCardProps) {
  const progress = course.progress_pct ?? 0;
  const hasProgress = showProgress && progress > 0;
  const isLocked = course.access_state === 'locked' || course.access_state === 'blocked' || course.access_state === 'expired';
  const hasFreePreview = course.access_state === 'preview';

  const Wrapper = isLocked && course.checkout_url ? 'a' : Link;
  const wrapperProps = isLocked && course.checkout_url
    ? { href: course.checkout_url, target: '_blank', rel: 'noopener noreferrer' }
    : { to: '/cursos/$courseId' as const, params: { courseId: course.id } };

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className="group/card relative block cursor-pointer"
    >
      {/* Outer — cinematic scale on hover */}
      <div className="relative rounded-xl sm:rounded-2xl overflow-visible md:transition-all md:duration-[600ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.04] md:group-hover/card:z-30">

        {/* Ambient glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gold/0 md:group-hover/card:bg-gold/[0.05] md:transition-all md:duration-700 blur-3xl pointer-events-none" />

        {/* Card body */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 ring-white/[0.04] md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:ring-gold/15 md:transition-all md:duration-500">

          {/* Image — vertical poster 2:3 */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={course.title}
                className={`w-full h-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08] ${isLocked ? 'saturate-[0.45] brightness-[0.85]' : ''}`}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-card/40 via-muted/10 to-background flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/8" />
              </div>
            )}

            {/* Bottom gradient — tall, smooth for text legibility */}
            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

            {/* Hover darken overlay */}
            <div className={`absolute inset-0 md:transition-all md:duration-500 ${isLocked ? 'bg-black/20' : 'bg-black/0 md:group-hover/card:bg-black/30'}`} />

            {/* Subtle inner vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

            {/* Badge — top left */}
            {badge && (
              <div className="absolute top-2.5 left-2.5 z-10">{badge}</div>
            )}

            {/* Lock icon — discrete top-right */}
            {isLocked && (
              <div className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08]">
                <Lock className="h-3 w-3 text-white/45" />
              </div>
            )}

            {/* Play button — center */}
            {!isLocked && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold/95 shadow-[0_4px_24px_rgba(0,0,0,0.4)] scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]">
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 text-gold-foreground fill-gold-foreground ml-0.5" />
                </div>
              </div>
            )}

            {/* Title + meta — bottom */}
            <div className="absolute inset-x-0 bottom-0 px-3.5 sm:px-4 pb-4 sm:pb-5 z-10">
              <h3 className="text-sm sm:text-[15px] font-bold text-white line-clamp-2 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight">
                {course.title}
              </h3>

              {isLocked ? (
                <p className="text-[9px] sm:text-[10px] text-white/30 mt-1.5 uppercase tracking-[0.18em] font-semibold">
                  Acesso restrito
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2 mt-2 opacity-80 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-400 md:delay-75">
                    {course.total_lessons > 0 && (
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-white/40 font-medium">
                        <BookOpenCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {course.total_lessons} aulas
                      </span>
                    )}
                    {hasProgress && (
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-gold/85 font-bold tabular-nums">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {progress}%
                      </span>
                    )}
                  </div>

                  {course.short_description && (
                    <p className="text-[10px] sm:text-[11px] text-white/35 mt-1.5 line-clamp-2 leading-relaxed hidden md:block opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-500 md:delay-150">
                      {course.short_description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Progress bar — bottom edge */}
            {hasProgress && !isLocked && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/[0.06] z-20">
                <div
                  className={`h-full rounded-r-full md:transition-all md:duration-700 ${progress >= 100 ? "bg-player-completed" : "bg-gold"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
