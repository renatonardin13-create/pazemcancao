import { Heart } from "lucide-react";

interface ValueMessageCardProps {
  message?: string;
}

export function ValueMessageCard({ message }: ValueMessageCardProps) {
  return (
    <div className="relative rounded-2xl border border-gold/8 overflow-hidden">
      {/* Barely-there gold atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.02] via-transparent to-gold/[0.01]" />
      <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gold/[0.025] blur-3xl animate-breathe" />

      <div className="relative backdrop-blur-sm px-6 sm:px-8 py-6 sm:py-7 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/6 border border-gold/10 mt-0.5">
          <Heart className="h-4 w-4 text-gold/60" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold/35 mb-2.5">
            Uma Palavra Para Você
          </p>
          <p className="text-sm leading-[1.9] text-foreground/60">
            {message || (
              <>
                Que essas canções sejam{" "}
                <span className="text-foreground/80">paz</span> para sua alma,{" "}
                <span className="text-foreground/80">força</span> para sua caminhada e{" "}
                <span className="text-foreground/80">presença de Deus</span> nos seus
                momentos mais silenciosos.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
