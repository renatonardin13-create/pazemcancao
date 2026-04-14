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
 * Netflix-style shelf card — 16:9 cinematic thumbnail with rich hover preview.
 * On desktop hover: card scales up, reveals extra info, play button, and description.
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
      {/* Outer container — scales up on hover (desktop only) */}
      <div className="relative rounded-xl overflow-visible md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.08] md:group-hover/card:z-30">
        
        {/* Shadow glow on hover */}
        <div className="absolute -inset-2 rounded-2xl bg-gold/0 md:group-hover/card:bg-gold/[0.04] md:transition-all md:duration-500 blur-xl pointer-events-none" />

        {/* Main card body */}
        <div className="relative rounded-xl overflow-hidden bg-card/10">
          
          {/* Image — 16:9 */}
          <div className="relative aspect-video overflow-hidden">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={course.title}
                className={`w-full h-full object-cover md:transition-transform md:duration-700 md:ease-out md:group-hover/card:scale-110 ${isLocked ? 'saturate-[0.3]' : ''}`}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-card/30 via-muted/10 to-background flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/15" />
              </div>
            )}

            {/* Overlay layers */}
            <div className={`absolute inset-0 md:transition-all md:duration-500 ${isLocked ? 'bg-black/40 md:group-hover/card:bg-black/55' : 'bg-black/0 md:group-hover/card:bg-black/50'}`} />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Badge — top left */}
            {badge && (
              <div className="absolute top-2.5 left-2.5 z-10">{badge}</div>
            )}

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              {isLocked ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 opacity-80 md:group-hover/card:opacity-100 md:transition-opacity md:duration-300">
                  <Lock className="h-4 w-4 text-white/70" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 shadow-2xl shadow-gold/40 backdrop-blur-sm scale-75 opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500 md:ease-out">
                  <Play className="h-6 w-6 text-gold-foreground fill-gold-foreground ml-0.5" />
                </div>
              )}
            </div>

            {/* Title + meta — always visible, enriched on hover */}
            <div className="absolute inset-x-0 bottom-0 p-4 z-10 md:translate-y-1 md:group-hover/card:translate-y-0 md:transition-transform md:duration-500 md:ease-out">
              <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-lg">
                {course.title}
              </h3>

              {isLocked ? (
                <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-medium">
                  Acesso bloqueado
                </p>
              ) : (
                <>
                  {/* Meta info row — visible on hover */}
                  <div className="flex items-center gap-2 mt-1.5 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-400 md:delay-75">
                    {course.total_lessons > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/50 font-medium">
                        <BookOpenCheck className="h-3 w-3" />
                        {course.total_lessons} aulas
                      </span>
                    )}
                    {hasProgress && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gold/80 font-bold tabular-nums">
                        <Clock className="h-3 w-3" />
                        {progress}%
                      </span>
                    )}
                  </div>

                  {/* Description — only on hover */}
                  {course.short_description && (
                    <p className="text-[11px] text-white/50 mt-1.5 line-clamp-2 leading-relaxed hidden md:block opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-500 md:delay-100">
                      {course.short_description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Progress bar */}
            {hasProgress && !isLocked && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
                <div
                  className={`h-full rounded-r-full md:transition-all md:duration-700 ${progress >= 100 ? "bg-player-completed" : "bg-gold"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Border glow on hover */}
        <div className={`absolute inset-0 rounded-xl border border-transparent md:transition-colors md:duration-500 pointer-events-none z-20 ${isLocked ? 'md:group-hover/card:border-white/10' : 'md:group-hover/card:border-gold/25'}`} />
      </div>
    </Wrapper>
  );
}
