import { Lock, Check, X, ShoppingCart, Sparkles, Clock3, BookOpen, Tag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ProductType = "curso_individual" | "assinatura";

interface UnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType?: ProductType;
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

export function UnlockModal({
  open,
  onOpenChange,
  productType = "curso_individual",
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
  const handleUnlock = () => {
    if (comingSoon) return;
    if (checkoutUrl) window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  const isSubscription = productType === "assinatura";
  const displayDescription = comingSoon
    ? (description || "Disponível em breve. Estamos preparando um conteúdo especial para você.")
    : description;

  // Atributos curtos (badges no topo do conteúdo).
  const attrs: Array<{ icon: typeof BookOpen; label: string }> = [];
  if (totalLessons && totalLessons > 0) {
    attrs.push({ icon: BookOpen, label: `${totalLessons} ${totalLessons === 1 ? "aula" : "aulas"}` });
  }
  if (totalDuration) attrs.push({ icon: Clock3, label: totalDuration });
  if (categoryName) attrs.push({ icon: Tag, label: categoryName });

  const realBenefits = (benefits && benefits.length > 0) ? benefits.filter(Boolean) : [];

  const accessLabel = isSubscription ? "Assinatura" : "Pagamento único";
  const accessHint = isSubscription ? "acesso recorrente" : "acesso vitalício";
  const ctaDisabled = comingSoon || !checkoutUrl;
  const ctaLabel = comingSoon ? "EM BREVE" : checkoutUrl ? "DESBLOQUEAR ACESSO" : "EM BREVE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md overflow-hidden border-0 bg-transparent p-0 shadow-none data-[state=open]:animate-scale-in"
      >
        {/* Wrapper premium: borda dourada com gradiente + glow */}
        <div className="relative rounded-2xl bg-gradient-to-b from-gold/30 via-gold/10 to-gold/20 p-[1px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9),0_0_60px_-15px_rgba(212,175,55,0.25)]">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a0a0c] via-[#0c0a08] to-black">
            {/* Botão fechar discreto */}
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 backdrop-blur-md transition-all hover:scale-105 hover:border-gold/40 hover:bg-black/80 hover:text-gold"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Capa grande */}
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold/15 via-amber-900/10 to-black">
                  <Lock className="h-16 w-16 text-gold/40" />
                </div>
              )}
              {/* Vinheta + fade pro conteúdo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.25),transparent_60%)]" />

              {/* Selo Premium */}
              <div className="absolute left-5 top-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold backdrop-blur-md shadow-lg shadow-black/40">
                  <Sparkles className="h-3 w-3" /> Premium
                </span>
              </div>

              {/* Título sobreposto */}
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
                <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] line-clamp-2">
                  {title}
                </h2>
                {attrs.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {attrs.map((a) => (
                      <span
                        key={a.label}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2.5 py-0.5 text-[10px] font-medium text-white/75 backdrop-blur-sm"
                      >
                        <a.icon className="h-3 w-3 text-gold/80" />
                        {a.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4 px-6 py-5">
              {displayDescription && (
                <p className="text-sm leading-relaxed text-white/65 line-clamp-4">
                  {displayDescription}
                </p>
              )}

              {realBenefits.length > 0 && (
                <ul className="space-y-2">
                  {realBenefits.slice(0, 4).map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-white/85">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/15">
                        <Check className="h-3 w-3 text-gold" />
                      </span>
                      <span className="leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Box de preço em destaque */}
              {price && !comingSoon && (
                <div className="relative overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.12] via-gold/[0.04] to-transparent px-4 py-3.5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(212,175,55,0.18),transparent_60%)]" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/75">
                        {accessLabel}
                      </div>
                      <div className="mt-0.5 text-3xl font-bold leading-none text-gold">
                        {price}
                      </div>
                      <div className="mt-1 text-[10px] text-white/45">{accessHint}</div>
                    </div>
                    <span className="rounded-full border border-gold/30 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold/85">
                      Oferta
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <Button
                  variant="premium"
                  size="lg"
                  className="h-12 w-full text-sm font-bold tracking-wide shadow-[0_10px_30px_-10px_rgba(212,175,55,0.6)]"
                  onClick={handleUnlock}
                  disabled={ctaDisabled}
                >
                  {!comingSoon && <ShoppingCart className="h-4 w-4" />}
                  {ctaLabel}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-white/55 hover:bg-white/[0.04] hover:text-white/80"
                  onClick={() => onOpenChange(false)}
                >
                  Agora não
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
