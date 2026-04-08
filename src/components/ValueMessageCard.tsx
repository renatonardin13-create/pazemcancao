import { Heart, Sparkles } from "lucide-react";

interface ValueMessageCardProps {
  message?: string;
}

export function ValueMessageCard({ message }: ValueMessageCardProps) {
  return (
    <div className="relative rounded-2xl border border-gold/12 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.04] via-transparent to-gold/[0.02]" />
      <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gold/[0.05] blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-gold/[0.03] blur-2xl" />

      <div className="relative backdrop-blur-sm px-6 sm:px-8 py-6 sm:py-7 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/10 border border-gold/15 shadow-sm shadow-gold/5 mt-0.5">
          <Heart className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3 w-3 text-gold/50" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/50">
              Uma Palavra Para Você
            </p>
          </div>
          <p className="text-sm sm:text-[15px] leading-relaxed text-foreground/75 font-body">
            {message || (
              <>
                Que essas canções sejam{" "}
                <span className="font-semibold text-foreground/90">paz</span> para sua alma,{" "}
                <span className="font-semibold text-foreground/90">força</span> para sua caminhada e{" "}
                <span className="font-semibold text-foreground/90">presença de Deus</span> nos seus
                momentos mais silenciosos. Cada louvor foi preparado com oração — ouça com o coração aberto.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
