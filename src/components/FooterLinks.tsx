import { Link } from "@tanstack/react-router";

interface FooterLinksProps {
  variant?: "full" | "minimal";
}

export function FooterLinks({ variant = "full" }: FooterLinksProps) {
  return (
    <footer className="border-t border-border/15 py-8 text-center">
      {variant === "full" && (
        <p className="font-display text-xs font-semibold text-muted-foreground/30 mb-2 tracking-wide">
          Paz em Canção
        </p>
      )}
      <div className="flex items-center justify-center gap-4 mb-2 text-[10px] text-muted-foreground/25">
        <Link to="/termos" className="hover:text-muted-foreground/45 transition-colors duration-500">
          Termos de Uso
        </Link>
        <span className="text-border/30">·</span>
        <Link to="/privacidade" className="hover:text-muted-foreground/45 transition-colors duration-500">
          Privacidade
        </Link>
      </div>
      <p className="text-[10px] text-muted-foreground/20">
        © {new Date().getFullYear()} Paz em Canção
      </p>
    </footer>
  );
}
