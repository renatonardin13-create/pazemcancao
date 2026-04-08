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
        <Heart className="h-4 w-4 text-gold/30 mx-auto mb-6" />

        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-gold/30 mb-6">
          Para Você, Que Ainda Acredita
        </p>

        <p className="text-[15px] sm:text-base leading-[2.3] text-foreground/55 font-light">
          {message || (
            <>
              Se você chegou até aqui, é porque seu coração ainda busca{" "}
              <em className="text-foreground/75 not-italic">cura</em>.<br />
              Essas canções foram feitas para os momentos em que as palavras não bastam —{" "}
              para as <em className="text-foreground/75 not-italic">madrugadas difíceis</em>,{" "}
              para o <em className="text-foreground/75 not-italic">choro silencioso</em>,{" "}
              para a alma que precisa saber que{" "}
              <em className="text-foreground/75 not-italic">não está sozinha</em>.
            </>
          )}
        </p>

        <div className="mx-auto mt-8 w-px h-8 bg-gradient-to-b from-gold/10 to-transparent" />
      </div>
    </div>
  );
}
