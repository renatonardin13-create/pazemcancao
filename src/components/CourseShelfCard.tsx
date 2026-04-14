import { Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
 * Premium shelf card used across all horizontal shelves on the student home.
 * Consistent styling, hover effects, and layout for all sections.
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
      className="group block rounded-2xl border border-border/15 bg-card/[0.06] overflow-hidden transition-all duration-500 hover:border-gold/20 hover:bg-card/15 hover:shadow-xl hover:shadow-gold/[0.06] hover:-translate-y-1"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/15 to-muted/5 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/20" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {/* Glow ring on hover */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.04] group-hover:ring-gold/15 transition-all duration-500" />

        {/* Badge slot */}
        {badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            {badge}
          </div>
        )}

        {/* Hover play icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/85 shadow-xl shadow-gold/25 backdrop-blur-sm">
            <Play className="h-4 w-4 text-background fill-background ml-0.5" />
          </div>
        </div>

        {/* Progress bar at bottom of image */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.06]">
            <div
              className={`h-full transition-all duration-700 rounded-r-full ${progress >= 100 ? "bg-emerald-400" : "bg-gold"}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 pt-3">
        <h3 className="text-[13px] font-bold text-foreground/85 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-300">
          {course.title}
        </h3>

        {showDescription && course.short_description && (
          <p className="text-[10px] text-muted-foreground/40 mt-1.5 line-clamp-1 leading-relaxed">
            {course.short_description}
          </p>
        )}

        {hasProgress && (
          <div className="flex items-center gap-2.5 mt-2.5">
            <Progress value={progress} className="h-1 flex-1 bg-muted/10" />
            <span className="text-[10px] font-bold text-gold/75 tabular-nums whitespace-nowrap">
              {progress}%
            </span>
          </div>
        )}

        {showCta && (
          <div className="mt-2.5 flex items-center text-[10px] font-bold text-gold/55 uppercase tracking-wider group-hover:text-gold/80 transition-colors duration-300">
            {ctaLabel} <ArrowRight className="h-3 w-3 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </Link>
  );
}
