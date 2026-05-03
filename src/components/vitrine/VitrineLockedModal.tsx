import { Lock, X, ArrowRight, BookOpen, Clock3, Tag, Layers, ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getContentPresentationUrl } from "@/lib/vitrine-access";
import type { VitrineCourse } from "./types";

interface VitrineLockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: VitrineCourse;
}

const TYPE_LABEL: Record<string, string> = {
  curso_individual: "Curso",
  assinatura: "Assinatura",
  ebook: "Ebook",
  pack: "Pack",
  aula: "Aula",
  mentoria: "Mentoria",
};

const FALLBACK_DESCRIPTION =
  "Conteúdo exclusivo da plataforma. Conheça os detalhes na página de apresentação.";

export function VitrineLockedModal({ open, onOpenChange, course }: VitrineLockedModalProps) {
  const cover = course.banner_image_url || course.cover_image_url || null;
  const title = course.title?.trim() || "Conteúdo exclusivo";
  const description =
    (course.short_description || course.sales_description || course.full_description || "").trim() ||
    FALLBACK_DESCRIPTION;

  const presentationUrl = getContentPresentationUrl(course);
  const ctaDisabled = !presentationUrl;

  const metaChips: Array<{ icon: typeof BookOpen; label: string }> = [];
  if (course.product_type && TYPE_LABEL[course.product_type]) {
    metaChips.push({ icon: Layers, label: TYPE_LABEL[course.product_type] });
  }
  if (course.total_lessons && course.total_lessons > 0) {
    metaChips.push({
      icon: BookOpen,
      label: `${course.total_lessons} ${course.total_lessons === 1 ? "aula" : "aulas"}`,
    });
  }
  if (course.total_duration) metaChips.push({ icon: Clock3, label: course.total_duration });
  if (course.category_name) metaChips.push({ icon: Tag, label: course.category_name });

  const handleOpenPresentation = () => {
    if (!presentationUrl) return;
    window.open(presentationUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden border border-gold/20 bg-gradient-to-b from-background via-background to-black/90 p-0 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-scale-in">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-gold/10 via-amber-900/10 to-black">
          {cover ? (
            <img src={cover} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-gold/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-md transition-all hover:bg-black/70 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-5 right-5">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              <Lock className="h-2.5 w-2.5" /> Conteúdo bloqueado
            </span>
            <h2 className="line-clamp-2 text-xl font-bold leading-tight text-foreground">{title}</h2>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {metaChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {metaChips.map((m) => (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-card/40 px-2.5 py-1 text-[10px] font-medium text-foreground/80"
                >
                  <m.icon className="h-3 w-3 text-gold/80" />
                  {m.label}
                </span>
              ))}
            </div>
          )}

          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{description}</p>

          <div className="space-y-2 pt-1">
            <Button
              variant="premium"
              size="lg"
              className="w-full"
              onClick={handleOpenPresentation}
              disabled={ctaDisabled}
              title={ctaDisabled ? "Página de apresentação indisponível" : undefined}
            >
              Conhecer este conteúdo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground/70"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
