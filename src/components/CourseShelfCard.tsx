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
 * Premium streaming-style shelf card — cinematic 16:9 with rich hover.
 */
export function CourseShelfCard({
  course,
  badge,
  showProgress = false,
}: CourseShelfCardProps) {
  const progress = course.progress_pct ?? 0;
  const hasProgress = showProgress && progress > 0;
  const isLocked = course.access_state === 'locked' || course.access_state === 'blocked' || course.access_state === 'expired';

  const Wrapper = isLocked && course.checkout_url ? 'a' : Link;
  const wrapperProps = isLocked && course.checkout_url
    ? { href: course.checkout_url, target: '_blank', rel: 'noopener noreferrer' }
    : { to: '/cursos/$courseId' as const, params: { courseId: course.id } };

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className="group/card relative block cursor-pointer"
    >
      {/* Outer container — cinematic scale on hover */}
      <div className="relative rounded-2xl overflow-visible md:transition-all md:duration-[600ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.05] md:group-hover/card:z-30">
        
        {/* Ambient glow on hover */}
        <div className="absolute -inset-3 rounded-3xl bg-gold/0 md:group-hover/card:bg-gold/[0.06] md:transition-all md:duration-700 blur-2xl pointer-events-none" />

        {/* Main card body */}
        <div className="relative rounded-2xl overflow-hidden bg-card/5 shadow-lg shadow-black/20 md:group-hover/card:shadow-2xl md:group-hover/card:shadow-black/40 md:transition-shadow md:duration-500">
          
          {/* Image — poster 2:3 */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={course.title}
                className={`w-full h-full object-cover md:transition-transform md:duration-[800ms] md:ease-out md:group-hover/card:scale-[1.12] ${isLocked ? 'saturate-[0.25] brightness-75' : ''}`}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-card/40 via-muted/10 to-background flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/10" />
              </div>
            )}

            {/* Cinematic gradient overlays */}
            <div className={`absolute inset-0 md:transition-all md:duration-500 ${isLocked ? 'bg-black/45 md:group-hover/card:bg-black/55' : 'bg-black/0 md:group-hover/card:bg-black/45'}`} />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/20 to-transparent opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-500" />

            {/* Badge — top left */}
            {badge && (
              <div className="absolute top-3 left-3 z-10">{badge}</div>
            )}

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              {isLocked ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur-lg border border-white/[0.08] opacity-70 md:group-hover/card:opacity-100 md:transition-all md:duration-400">
                  <Lock className="h-4.5 w-4.5 text-white/60" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold shadow-2xl shadow-gold/30 backdrop-blur-sm scale-[0.6] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]">
                  <Play className="h-7 w-7 text-gold-foreground fill-gold-foreground ml-0.5" />
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="absolute inset-x-0 bottom-0 p-5 z-10 md:translate-y-1 md:group-hover/card:translate-y-0 md:transition-transform md:duration-500 md:ease-out">
              <h3 className="text-[15px] font-bold text-white line-clamp-2 leading-[1.3] drop-shadow-xl tracking-tight">
                {course.title}
              </h3>

              {isLocked ? (
                <p className="text-[10px] text-white/35 mt-1.5 uppercase tracking-[0.15em] font-medium">
                  Acesso restrito
                </p>
              ) : (
                <>
                  {/* Meta info row */}
                  <div className="flex items-center gap-2.5 mt-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-400 md:delay-75">
                    {course.total_lessons > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/45 font-medium">
                        <BookOpenCheck className="h-3 w-3" />
                        {course.total_lessons} aulas
                      </span>
                    )}
                    {hasProgress && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gold/90 font-bold tabular-nums">
                        <Clock className="h-3 w-3" />
                        {progress}%
                      </span>
                    )}
                  </div>

                  {/* Description — only on hover */}
                  {course.short_description && (
                    <p className="text-[11px] text-white/40 mt-2 line-clamp-2 leading-relaxed hidden md:block opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-500 md:delay-150">
                      {course.short_description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Progress bar */}
            {hasProgress && !isLocked && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.06] z-20">
                <div
                  className={`h-full rounded-r-full md:transition-all md:duration-700 ${progress >= 100 ? "bg-player-completed" : "bg-gold"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Border accent on hover */}
        <div className={`absolute inset-0 rounded-2xl border md:transition-all md:duration-500 pointer-events-none z-20 ${isLocked ? 'border-transparent md:group-hover/card:border-white/[0.06]' : 'border-transparent md:group-hover/card:border-gold/20'}`} />
      </div>
    </Wrapper>
  );
}
