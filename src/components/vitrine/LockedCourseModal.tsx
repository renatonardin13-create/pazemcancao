import { ExternalLink, Lock, X, BookOpen, Clock, Tag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { VitrineCourse } from "@/components/vitrine/types";
import { getCourseSalesPageUrl } from "@/lib/course-links";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: VitrineCourse | null;
}

export function LockedCourseModal({ open, onOpenChange, course }: Props) {
  if (!course) return null;

  const cover = course.cover_image_url || course.banner_image_url;
  const rawDescription =
    course.short_description || course.sales_description || course.full_description;
  const description =
    rawDescription && rawDescription.trim().length > 0
      ? rawDescription
      : "Um conteúdo preparado com cuidado para fortalecer sua caminhada. Conheça os detalhes e veja se faz sentido para este momento.";
  const lessons = Number(course.total_lessons || 0);
  const duration = course.total_duration;
  const category = course.category_name;

  const salesUrl = getCourseSalesPageUrl(course);
  const ctaDisabled = !salesUrl;

  const handleSales = () => {
    if (!salesUrl) return;
    window.open(salesUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-0 bg-transparent p-0 shadow-none data-[state=open]:animate-scale-in">
        <div className="relative rounded-2xl bg-gradient-to-b from-primary/30 via-primary/10 to-primary/20 p-[1px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9),0_0_60px_-15px_rgba(212,175,55,0.25)]">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a0a0c] via-[#0c0a08] to-black">
            {/* Hero image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              {cover ? (
                <img
                  src={cover}
                  alt={course.title}
                  className="absolute inset-0 h-full w-full object-cover brightness-[0.65]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-amber-900/10 to-black">
                  <Lock className="h-16 w-16 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />

              {/* Close */}
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Fechar"
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 backdrop-blur-md transition-all hover:border-primary/40 hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Locked badge */}
              <div className="absolute left-4 top-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-md">
                  <Lock className="h-3 w-3" /> Conteúdo bloqueado
                </span>
              </div>

              {/* Title */}
              <div className="absolute inset-x-0 bottom-0 px-6 pb-5">
                <h2 className="line-clamp-2 text-2xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  {course.title}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-5">
              <p className="line-clamp-4 text-sm leading-relaxed text-white/75">{description}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                {category && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/75">
                    <Tag className="h-3 w-3 text-primary/80" /> {category}
                  </span>
                )}
                {lessons > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/75">
                    <BookOpen className="h-3 w-3 text-primary/80" /> {lessons} aula{lessons > 1 ? "s" : ""}
                  </span>
                )}
                {duration && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/75">
                    <Clock className="h-3 w-3 text-primary/80" /> {duration}
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-1">
                <Button
                  variant="premium"
                  size="lg"
                  className="h-12 w-full text-sm font-bold tracking-wide shadow-[0_10px_30px_-10px_rgba(212,175,55,0.6)]"
                  onClick={handleSales}
                  disabled={ctaDisabled}
                >
                  {ctaDisabled ? "Em breve" : "Saiba mais sobre este conteúdo"}
                  {!ctaDisabled && <ExternalLink className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-white/55 hover:bg-white/[0.04] hover:text-white/80"
                  onClick={() => onOpenChange(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
