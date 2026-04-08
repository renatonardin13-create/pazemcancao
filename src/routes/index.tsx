import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FooterLinks } from "@/components/FooterLinks";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Atmospheric depth layers — like candlelight in darkness */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,var(--color-gold)/0.05,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_70%,var(--color-gold)/0.025,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,var(--color-gold)/0.018,transparent_40%)]" />

      {/* Breathing orbs — gentle, alive */}
      <div className="pointer-events-none absolute top-[20%] right-[20%] h-80 w-80 rounded-full bg-gold/[0.02] blur-[100px] animate-breathe" />
      <div className="pointer-events-none absolute bottom-[25%] left-[15%] h-56 w-56 rounded-full bg-gold/[0.018] blur-[80px] animate-breathe" style={{ animationDelay: '3s' }} />

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-28 overflow-hidden">
        <div className="relative z-10 max-w-xl text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {/* Delicate golden cross / spiritual mark */}
          <div className="mx-auto mb-10 w-px h-12 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

          <p className="mb-5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-gold/50">
            Uma experiência íntima de adoração
          </p>

          <h1 className="font-display text-5xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Paz em Canção
          </h1>

          <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

          <p className="mx-auto mt-7 max-w-md text-base leading-[1.8] text-muted-foreground/70">
            30 louvores inéditos, criados para os momentos em que
            a alma precisa de silêncio, cura e presença.
          </p>

          <div className="mt-14 animate-in fade-in duration-700 delay-700">
            <Link
              to="/login"
              className="group inline-flex items-center gap-3 rounded-full bg-gold/90 text-gold-foreground px-10 py-4 text-sm font-bold tracking-wide shadow-2xl shadow-gold/15 transition-all duration-500 hover:bg-gold hover:shadow-gold/25 active:scale-[0.97]"
            >
              Acessar Minha Área
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="mt-8 text-[11px] text-muted-foreground/35 tracking-wide">
            Acesso exclusivo para compradores
          </p>
        </div>
      </section>

      <FooterLinks variant="minimal" />
    </div>
  );
}
