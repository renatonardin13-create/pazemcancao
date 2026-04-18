import { Lock, Clock3 } from "lucide-react";
import type { ProductAccessState } from "@/lib/product-access";

interface Props {
  state: Extract<ProductAccessState, "locked" | "coming_soon">;
}

export function ProductCardLockedOverlay({ state }: Props) {
  if (state === "coming_soon") {
    return (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/55 backdrop-blur-[2px]">
        <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black shadow-lg">
          <Clock3 className="mr-1 inline h-3 w-3" />
          Em breve
        </span>
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/40 backdrop-blur-[2px]">
      <div className="relative">
        <div className="absolute -inset-3 rounded-full bg-gold/10 blur-xl animate-pulse" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/20 to-amber-600/10 shadow-lg shadow-gold/10">
          <Lock className="h-6 w-6 text-gold/70" />
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/65">Conteúdo Premium</span>
    </div>
  );
}
