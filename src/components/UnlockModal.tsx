import { Lock, Check, X, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  coverUrl?: string | null;
  price?: string;
  checkoutUrl?: string | null;
}

const benefits = [
  "Acesso imediato após pagamento",
  "Músicas exclusivas e originais",
  "Qualidade profissional",
  "Atualizações contínuas",
];

export function UnlockModal({ open, onOpenChange, title, coverUrl, price = "R$ 49,90", checkoutUrl }: UnlockModalProps) {
  const handleUnlock = () => {
    if (checkoutUrl) window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

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
            <h2 className="text-xl font-bold text-foreground leading-tight">Desbloqueie o acesso completo</h2>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tenha acesso imediato a todas as músicas exclusivas da plataforma e conteúdos premium.
          </p>

          <ul className="space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-foreground/85">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 border border-gold/30 shrink-0">
                  <Check className="h-3 w-3 text-gold" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] to-transparent px-4 py-3 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">Pagamento único</div>
              <div className="text-2xl font-bold text-gold">{price}</div>
            </div>
            <span className="text-[10px] text-muted-foreground">sem mensalidade</span>
          </div>

          <div className="space-y-2 pt-1">
            <Button variant="premium" size="lg" className="w-full" onClick={handleUnlock} disabled={!checkoutUrl}>
              <ShoppingCart className="h-4 w-4" />
              QUERO LIBERAR AGORA
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => onOpenChange(false)}>
              Agora não
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
