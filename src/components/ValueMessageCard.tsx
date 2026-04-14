import { Heart } from "lucide-react";

interface ValueMessageCardProps {
  message?: string;
}

export function ValueMessageCard({ message }: ValueMessageCardProps) {
  return (
    <div className="relative py-10 sm:py-14">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-gold/[0.01] blur-[80px] animate-breathe" />

      <div className="relative max-w-lg mx-auto text-center">
        <Heart className="h-4 w-4 text-gold/30 mx-auto mb-6" />

        <p className="text-xs font-medium uppercase tracking-[0.4em] text-gold/30 mb-6">
          Seu Espaço de Presença
        </p>

        <p className="text-[15px] sm:text-base leading-[2.3] text-foreground/55 font-light">
          {message || (
            <>
              Estas canções foram criadas para ser um{" "}
              <em className="text-foreground/90 not-italic">refúgio</em>.<br />
              Para momentos de{" "}
              <em className="text-foreground/90 not-italic">oração</em>,{" "}
              de <em className="text-foreground/90 not-italic">quietude</em>,{" "}
              de reencontro com a{" "}
              <em className="text-foreground/90 not-italic">paz</em> que vem de Deus.
            </>
          )}
        </p>

        <div className="mx-auto mt-8 w-px h-8 bg-gradient-to-b from-gold/10 to-transparent" />
      </div>
    </div>
  );
}
