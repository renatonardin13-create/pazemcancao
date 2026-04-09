import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-paz-em-cancao.png";

interface FooterLinksProps {
  variant?: "full" | "minimal";
}

export function FooterLinks({ variant = "full" }: FooterLinksProps) {
  return (
    <footer className="border-t border-gold/10 py-5 text-center">
      <div className="flex items-center justify-center gap-5 mb-3 text-xs text-muted-foreground/50">
        <Link to="/termos" className="hover:text-gold/60 transition-colors duration-500">
          Termos de Uso
        </Link>
        <span className="text-gold/20">·</span>
        <Link to="/privacidade" className="hover:text-gold/60 transition-colors duration-500">
          Privacidade
        </Link>
      </div>
      <p className="text-xs text-muted-foreground/40">
        © {new Date().getFullYear()} Paz em Canção
      </p>
    </footer>
  );
}
