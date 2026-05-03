import { Lock, Check, X, ArrowRight, BookOpen, Clock3, Tag, Layers } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ProductType = "curso_individual" | "assinatura";

interface UnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType?: ProductType;
  productId?: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  price?: string;
  checkoutUrl?: string | null;
  benefits?: string[];
  totalLessons?: number | null;
  totalDuration?: string | null;
  categoryName?: string | null;
  /** Curso ainda não lançado — desabilita CTA de compra e exibe "Em breve". */
  comingSoon?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  curso_individual: "Curso",
  assinatura: "Assinatura",
  ebook: "Ebook",
  pack: "Pack",
  aula: "Aula",
};


export function UnlockModal({
  open,
  onOpenChange,
  productType = "curso_individual",
  productId,
  title,
  description,
  coverUrl,
  price,
  checkoutUrl,
  benefits,
  totalLessons,
  totalDuration,
  categoryName,
  comingSoon = false,
}: UnlockModalProps) {
  const navigate = useNavigate();

  const handlePrimary = () => {
    if (comingSoon) return;
    // Sem productId interno → leva direto para a página de vendas (fallback elegante)
    if (!productId) {
      if (checkoutUrl) window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      onOpenChange(false);
      return;
    }
    onOpenChange(false);
    navigate({ to: "/cursos/$courseId", params: { courseId: productId } });
  };

  const handleSecondary = () => {
    if (comingSoon) return;
    if (checkoutUrl) window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  const isSubscription = productType === "assinatura";

  const displayTitle = title;
  const displayDescription = comingSoon
    ? (description || "Disponível em breve.")
    : description;

  const realBenefits = (benefits && benefits.length > 0) ? benefits.filter(Boolean) : [];

  // Meta chips (categoria, tipo, aulas, duração) — sempre exibidos quando existirem
  const metaChips: Array<{ icon: typeof BookOpen; label: string }> = [];
  if (totalLessons && totalLessons > 0) {
    metaChips.push({ icon: BookOpen, label: `${totalLessons} ${totalLessons === 1 ? "aula" : "aulas"}` });
  }
  if (totalDuration) metaChips.push({ icon: Clock3, label: totalDuration });
  if (categoryName) metaChips.push({ icon: Tag, label: categoryName });
  if (productType && TYPE_LABEL[productType]) {
    metaChips.push({ icon: Layers, label: TYPE_LABEL[productType] });
  }

  const accessLabel = isSubscription ? "Assinatura" : "Pagamento único";
  const accessHint = isSubscription ? "acesso recorrente" : "sem mensalidade";
  const primaryDisabled = comingSoon || (!productId && !checkoutUrl);
  const primaryLabel = comingSoon
    ? "Em breve"
    : !productId && checkoutUrl
      ? "Ir para página de vendas"
      : "Ver detalhes do produto";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border border-gold/20 bg-gradient-to-b from-background via-background to-black/90 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-scale-in">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-gold/10 via-amber-900/10 to-black">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="h-16 w-16 text-gold/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/70 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-2">
              <Lock className="h-2.5 w-2.5" /> Premium
            </span>
            <h2 className="text-xl font-bold text-foreground leading-tight line-clamp-2">{displayTitle}</h2>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
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

          {displayDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {displayDescription}
            </p>
          )}

          {realBenefits.length > 0 && (
            <ul className="space-y-2.5">
              {realBenefits.slice(0, 4).map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/85">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 border border-gold/30 shrink-0">
                    <Check className="h-3 w-3 text-gold" />
                  </span>
                  <span className="leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {price && !comingSoon && (
            <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] to-transparent px-4 py-3 flex items-baseline justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">{accessLabel}</div>
                <div className="text-2xl font-bold text-gold">{price}</div>
              </div>
              <span className="text-[10px] text-muted-foreground">{accessHint}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <Button
              variant="premium"
              size="lg"
              className="w-full"
              onClick={handlePrimary}
              disabled={primaryDisabled}
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!comingSoon && checkoutUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-gold"
                onClick={handleSecondary}
              >
                Comprar agora
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground/60"
              onClick={() => onOpenChange(false)}
            >
              Agora não
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
