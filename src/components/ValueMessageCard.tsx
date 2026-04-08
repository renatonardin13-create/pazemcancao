import { Heart } from "lucide-react";

interface ValueMessageCardProps {
  message?: string;
}

export function ValueMessageCard({ message }: ValueMessageCardProps) {
  return (
    <div className="relative py-10 sm:py-14">
      {/* Warm presence */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-gold/[0.01] blur-[80px] animate-breathe" />

      <div className="relative max-w-lg mx-auto text-center">
        <Heart className="h-4 w-4 text-gold/25 mx-auto mb-6" />

        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-gold/20 mb-6">
          Uma Palavra Para Você
        </p>

        <p className="text-[15px] sm:text-base leading-[2.3] text-foreground/45 font-light">
          {message || (
            <>
              Que essas canções sejam{" "}
              <em className="text-foreground/65 not-italic">paz</em> para sua alma,{" "}
              <em className="text-foreground/65 not-italic">força</em> para sua caminhada
              e <em className="text-foreground/65 not-italic">presença de Deus</em> nos seus
              momentos mais silenciosos.
            </>
          )}
        </p>

        <div className="mx-auto mt-8 w-px h-8 bg-gradient-to-b from-gold/10 to-transparent" />
      </div>
    </div>
  );
}
