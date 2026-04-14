import { Heart, ExternalLink, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

const WHATSAPP_NUMBER = "5517988308037";
const SUPPORT_MESSAGE = encodeURIComponent("Olá, preciso de ajuda para acessar o Paz em Canção");

export function RestrictedAccessCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.02,transparent_70%)]" />

      <div className="relative max-w-sm text-center animate-in fade-in duration-1000">
        <div className="mx-auto mb-8 w-px h-14 bg-gradient-to-b from-transparent via-gold/12 to-transparent" />

        <Heart className="h-5 w-5 text-gold/35 mx-auto mb-6" />

        <h1 className="font-display text-2xl font-bold text-foreground">
          Área exclusiva
        </h1>
        <p className="mt-4 text-sm text-muted-foreground/50 leading-[1.9]">
          Este e-mail não possui compra registrada.<br />
          Se você já comprou, use o e-mail da compra.
        </p>

        <div className="mt-6 space-y-3">
          <a
            href="https://pazemcancao-oficial.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-8 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-gold/22 hover:text-gold/80 transition-all duration-500"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Adquira aqui
          </a>
        </div>

        <div className="mt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gold/45 hover:text-gold/70 transition-colors duration-500 underline underline-offset-4 decoration-gold/15 hover:decoration-gold/30"
          >
            Tentar com outro e-mail
          </Link>
        </div>

        <div className="mt-6">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${SUPPORT_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-300"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Suporte: (17) 98830-8037
          </a>
        </div>

        <div className="mx-auto mt-8 w-px h-8 bg-gradient-to-b from-gold/8 to-transparent" />
      </div>
    </div>
  );
}
