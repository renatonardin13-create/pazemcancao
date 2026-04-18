import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Play, ShoppingCart } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import type { VitrineCourse } from "./types";

interface VitrineFeaturedBannerProps {
  course: VitrineCourse;
}

export function VitrineFeaturedBanner({ course }: VitrineFeaturedBannerProps) {
  const title = course.display_title || course.title;
  const subtitle = course.display_subtitle || course.short_description || course.sales_description;
  const imageUrl = course.banner_image_url || course.cover_image_url;
  const isReleased = ["enrolled", "in_progress", "completed"].includes(course.access_state || "");
  const isComingSoon = course.access_state === "coming_soon";
  const salesUrl = course.banner_link_url || course.sales_page_url || course.checkout_url;

  return (
    <section className="mx-auto mb-8 w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
      <div className="overflow-hidden rounded-[28px] border border-gold/15 bg-gradient-to-br from-card/70 via-background to-background shadow-[0_20px_60px_-28px_rgba(0,0,0,0.75)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[250px] overflow-hidden sm:min-h-[320px] lg:min-h-[380px]">
            {imageUrl ? (
              <OptimizedImage
                src={imageUrl}
                alt={title}
                context="banner"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gold/12 via-background to-background" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background/15 via-background/45 to-background" />
          </div>

          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold sm:text-xs">
              Banner principal
            </span>

            <div className="space-y-2.5">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {title}
              </h2>
              {subtitle ? (
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground/72 sm:text-base">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/55 sm:text-xs">
              {course.total_lessons ? <span>{course.total_lessons} aulas</span> : null}
              {course.total_duration ? <span>{course.total_duration}</span> : null}
              {course.category_name ? <span>{course.category_name}</span> : null}
            </div>

            <div className="pt-2">
              {isComingSoon ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300">
                  <Clock3 className="h-4 w-4" />
                  Em breve
                </span>
              ) : isReleased ? (
                <Link
                  to="/cursos/$courseId"
                  params={{ courseId: course.id }}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-gold-foreground transition-transform hover:scale-[1.02]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Acessar curso
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : salesUrl ? (
                <a
                  href={salesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-3 text-sm font-bold text-gold transition-transform hover:scale-[1.02] hover:bg-gold/15"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Comprar agora
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}