import { Heart } from "lucide-react";

interface ValueMessageCardProps {
  message?: string;
}

export function ValueMessageCard({ message }: ValueMessageCardProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Barely-there gold warmth */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/[0.015] blur-[60px] animate-breathe" />

      <div className="relative px-6 sm:px-0 py-6 flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/5 mt-0.5">
          <Heart className="h-3.5 w-3.5 text-gold/40" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold/25 mb-3">
            Uma Palavra Para Você
          </p>
          <p className="text-[14px] leading-[2] text-foreground/50 font-light">
            {message || (
              <>
                Que essas canções sejam{" "}
                <span className="text-foreground/70">paz</span> para sua alma,{" "}
                <span className="text-foreground/70">força</span> para sua caminhada e{" "}
                <span className="text-foreground/70">presença de Deus</span> nos seus
                momentos mais silenciosos.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border/10 to-transparent" />
    </div>
  );
}
