import { Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight, Play, Clock, Layers } from "lucide-react";

interface CourseShelfCardProps {
  course: any;
  linkPrefix?: string;
  badge?: React.ReactNode;
  showDescription?: boolean;
  showProgress?: boolean;
  showCta?: boolean;
  ctaLabel?: string;
}

/**
 * Premium shelf card — cinematic catalog style with warm gold accents.
 */
export function CourseShelfCard({
  course,
  badge,
  showDescription = true,
  showProgress = false,
  showCta = true,
  ctaLabel = "Conhecer",
}: CourseShelfCardProps) {
  const progress = course.progress_pct ?? 0;
  const hasProgress = showProgress && progress > 0;

  return (
    <Link
      to="/cursos/$courseId"
      params={{ courseId: course.id }}
      className="group relative block rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-gold/[0.08]"
    >
      {/* Outer border glow */}
      <div className="absolute inset-0 rounded-2xl border border-border/12 group-hover:border-gold/20 transition-colors duration-500 z-10 pointer-events-none" />

      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-card/10">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card/20 via-muted/8 to-background flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/15" />
          </div>
        )}

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-40" />

        {/* Badge slot — top left */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            {badge}
          </div>
        )}

        {/* Hover play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 pointer-events-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/90 shadow-xl shadow-gold/30 backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-400">
            <Play className="h-4.5 w-4.5 text-gold-foreground fill-gold-foreground ml-0.5" />
          </div>
        </div>

        {/* Progress bar at bottom of image */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.06] z-10">
            <div
              className={`h-full rounded-r-full transition-all duration-700 ${progress >= 100 ? "bg-player-completed" : "bg-gold"}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-[13px] font-bold text-foreground/90 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-300 drop-shadow-sm">
            {course.title}
          </h3>

          {showDescription && course.short_description && (
            <p className="text-[10px] text-muted-foreground/45 mt-1.5 line-clamp-1 leading-relaxed">
              {course.short_description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2.5 mt-2">
            {course.lesson_count > 0 && (
              <span className="text-[9px] text-muted-foreground/35 flex items-center gap-1">
                <Layers className="h-2.5 w-2.5" />
                {course.lesson_count} aulas
              </span>
            )}
            {course.total_duration && (
              <span className="text-[9px] text-muted-foreground/35 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {course.total_duration}
              </span>
            )}
          </div>

          {hasProgress && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="h-1 flex-1 rounded-full bg-muted/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${progress >= 100 ? "bg-player-completed" : "bg-gold"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gold/70 tabular-nums">
                {progress}%
              </span>
            </div>
          )}

          {showCta && (
            <div className="mt-3 flex items-center text-[10px] font-bold text-gold/50 uppercase tracking-[0.15em] group-hover:text-gold/80 transition-colors duration-300">
              {ctaLabel}
              <ArrowRight className="h-3 w-3 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
