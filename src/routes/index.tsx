import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FooterLinks } from "@/components/FooterLinks";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Atmosphere — candlelight in silence */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_50%_25%,var(--color-gold)/0.035,transparent_70%)]" />
      <div className="pointer-events-none absolute top-[15%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gold/[0.012] blur-[180px] animate-breathe" />

      {/* Hero — one breath */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-28 overflow-hidden">
        <div className="relative z-10 max-w-md text-center animate-in fade-in slide-in-from-bottom-8 duration-[1200ms]">
          <div className="mx-auto mb-14 w-px h-20 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />

          <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.5em] text-gold/50">
            Uma experiência íntima de adoração
          </p>

          <h1 className="font-display text-5xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Paz em Canção
          </h1>

          <div className="mx-auto mt-8 h-px w-20 bg-gradient-to-r from-transparent via-gold/12 to-transparent" />

          <p className="mx-auto mt-8 max-w-xs text-[15px] leading-[2.2] text-muted-foreground/65 font-light">
            30 louvores inéditos, criados para os momentos em que
            a alma precisa de silêncio, cura e presença.
          </p>

          <div className="mt-16 animate-in fade-in duration-1000 delay-700">
            <Link
              to="/login"
              className="group inline-flex items-center gap-3 rounded-full bg-gold/18 text-gold/75 border border-gold/15 px-10 py-4 text-[12px] font-semibold tracking-wider uppercase transition-all duration-500 hover:bg-gold/28 hover:text-gold/90"
            >
              Acessar Minha Área
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="mt-10 text-[10px] text-muted-foreground/35 tracking-wider">
            Acesso exclusivo para compradores
          </p>
        </div>
      </section>

      <FooterLinks variant="minimal" />
    </div>
  );
}
