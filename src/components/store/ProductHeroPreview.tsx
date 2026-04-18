import { Lock, Sparkles, X } from "lucide-react";
import type { ReactNode } from "react";

interface ProductHeroPreviewProps {
  title: string;
  coverUrl?: string | null;
  onClose: () => void;
  meta?: ReactNode;
  badgeLabel?: string;
}

export function ProductHeroPreview({
  title,
  coverUrl,
  onClose,
  meta,
  badgeLabel = "Premium",
}: ProductHeroPreviewProps) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden">
      {coverUrl ? (
        <img src={coverUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold/15 via-amber-900/10 to-black">
          <Lock className="h-16 w-16 text-gold/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.25),transparent_60%)]" />

      <button
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/70 backdrop-blur-md transition-all hover:scale-105 hover:border-gold/40 hover:bg-black/80 hover:text-gold"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="absolute left-5 top-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold backdrop-blur-md shadow-lg shadow-black/40">
          <Sparkles className="h-3 w-3" /> {badgeLabel}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
        <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] line-clamp-2">
          {title}
        </h2>
        {meta && <div className="mt-3">{meta}</div>}
      </div>
    </div>
  );
}
