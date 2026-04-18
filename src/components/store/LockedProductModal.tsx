import { ShoppingCart, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductHeroPreview } from "./ProductHeroPreview";
import { ProductMetaList } from "./ProductMetaList";
import { PriceBox } from "./PriceBox";

export interface LockedProductModalData {
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  price?: string | null;
  checkoutUrl?: string | null;
  benefits?: string[];
  totalLessons?: number | null;
  totalDuration?: string | null;
  categoryName?: string | null;
  productType?: string | null;
  /** Curso ainda não lançado — desabilita CTA. */
  comingSoon?: boolean;
}

interface LockedProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: LockedProductModalData | null;
}

export function LockedProductModal({ open, onOpenChange, data }: LockedProductModalProps) {
  if (!data) return null;
  const {
    title,
    description,
    coverUrl,
    price,
    checkoutUrl,
    benefits = [],
    totalLessons,
    totalDuration,
    categoryName,
    productType,
    comingSoon = false,
  } = data;

  const handleUnlock = () => {
    if (comingSoon) return;
    if (checkoutUrl) window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  const realBenefits = benefits.filter(Boolean);
  const ctaDisabled = comingSoon || !checkoutUrl;
  const ctaLabel = comingSoon ? "EM BREVE" : checkoutUrl ? "DESBLOQUEAR ACESSO" : "EM BREVE";
  const isSubscription = productType === "assinatura";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-0 bg-transparent p-0 shadow-none data-[state=open]:animate-scale-in">
        <div className="relative rounded-2xl bg-gradient-to-b from-gold/30 via-gold/10 to-gold/20 p-[1px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9),0_0_60px_-15px_rgba(212,175,55,0.25)]">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a0a0c] via-[#0c0a08] to-black">
            <ProductHeroPreview
              title={title}
              coverUrl={coverUrl}
              onClose={() => onOpenChange(false)}
              meta={
                <ProductMetaList
                  totalLessons={totalLessons}
                  totalDuration={totalDuration}
                  categoryName={categoryName}
                  productType={productType}
                />
              }
            />

            <div className="space-y-4 px-6 py-5">
              {description && (
                <p className="text-sm leading-relaxed text-white/65 line-clamp-4">{description}</p>
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

              {price && !comingSoon && (
                <PriceBox
                  price={price}
                  label={isSubscription ? "Assinatura" : "Pagamento único"}
                  hint={isSubscription ? "acesso recorrente" : "acesso vitalício"}
                />
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
