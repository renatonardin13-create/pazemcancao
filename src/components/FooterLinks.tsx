import { Link } from "@tanstack/react-router";
import { Music } from "lucide-react";

interface FooterLinksProps {
  variant?: "full" | "minimal";
}

export function FooterLinks({ variant = "full" }: FooterLinksProps) {
  return (
    <footer className="border-t border-border/40 py-8 text-center">
      {variant === "full" && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <Music className="h-3.5 w-3.5 text-gold/50" />
          <span className="font-display text-xs font-semibold text-muted-foreground/50">
            Paz em Canção
          </span>
        </div>
      )}
      <div className="flex items-center justify-center gap-4 mb-2 text-[10px] text-muted-foreground/40">
        <Link to="/termos" className="hover:text-muted-foreground transition-colors">
          Termos de Uso
        </Link>
        <span>·</span>
        <Link to="/privacidade" className="hover:text-muted-foreground transition-colors">
          Privacidade
        </Link>
      </div>
      <p className="text-[10px] text-muted-foreground/40">
        © {new Date().getFullYear()} Paz em Canção · Todos os direitos reservados
      </p>
    </footer>
  );
}
