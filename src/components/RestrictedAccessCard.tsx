import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function RestrictedAccessCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.02,transparent_70%)]" />

      <div className="relative max-w-sm text-center animate-in fade-in duration-1000">
        <div className="mx-auto mb-8 w-px h-14 bg-gradient-to-b from-transparent via-gold/12 to-transparent" />

        <Heart className="h-5 w-5 text-gold/35 mx-auto mb-6" />

        <h1 className="font-display text-2xl font-bold text-foreground/85">
          Área exclusiva
        </h1>
        <p className="mt-4 text-sm text-muted-foreground/50 leading-[1.9]">
          Espaço reservado para quem possui<br />
          acesso à coleção Paz em Canção.
        </p>

        <div className="mt-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-8 py-3 text-[12px] font-semibold tracking-wider uppercase hover:bg-gold/22 hover:text-gold/80 transition-all duration-500"
          >
            Acessar Meu Espaço
          </Link>
        </div>

        <div className="mx-auto mt-10 w-px h-8 bg-gradient-to-b from-gold/8 to-transparent" />
      </div>
    </div>
  );
}
