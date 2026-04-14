import { Link } from "@tanstack/react-router";
import { BookOpen, Play, Lock } from "lucide-react";

interface CourseShelfCardProps {
  course: any;
  badge?: React.ReactNode;
  showProgress?: boolean;
  ctaLabel?: string;
  showDescription?: boolean;
  showCta?: boolean;
}

/**
 * Netflix-style shelf card — 16:9 cinematic thumbnail with hover overlay.
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
      className="group relative block rounded-xl overflow-hidden cursor-pointer"
    >
      {/* Image container — 16:9 */}
      <div className="relative aspect-video overflow-hidden bg-card/10">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isLocked ? 'saturate-[0.3]' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card/30 via-muted/10 to-background flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/15" />
          </div>
        )}

        {/* Dark overlay on hover (stronger for locked) */}
        <div className={`absolute inset-0 transition-all duration-500 ${isLocked ? 'bg-black/40 group-hover:bg-black/60' : 'bg-black/0 group-hover:bg-black/60'}`} />

        {/* Always-visible subtle bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Badge — top left */}
        {badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            {badge}
          </div>
        )}

        {/* Center icon — Play or Lock */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {isLocked ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
              <Lock className="h-4.5 w-4.5 text-white/70" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 shadow-2xl shadow-gold/40 backdrop-blur-sm scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out">
              <Play className="h-6 w-6 text-gold-foreground fill-gold-foreground ml-0.5" />
            </div>
          )}
        </div>

        {/* Title + info */}
        <div className="absolute inset-x-0 bottom-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-lg">
            {course.title}
          </h3>
          {isLocked ? (
            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-medium">
              Acesso bloqueado
            </p>
          ) : course.short_description ? (
            <p className="text-[11px] text-white/60 mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              {course.short_description}
            </p>
          ) : null}
        </div>

        {/* Progress bar */}
        {hasProgress && !isLocked && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
            <div
              className={`h-full rounded-r-full transition-all duration-700 ${progress >= 100 ? "bg-player-completed" : "bg-gold"}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Border glow on hover */}
      <div className={`absolute inset-0 rounded-xl border border-transparent transition-colors duration-500 pointer-events-none z-20 ${isLocked ? 'group-hover:border-white/10' : 'group-hover:border-gold/30'}`} />
    </Wrapper>
  );
}
