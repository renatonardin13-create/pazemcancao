import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, Lock, Download, Headphones, ArrowRight } from "lucide-react";
import { FooterLinks } from "@/components/FooterLinks";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Multi-layer atmospheric background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-gold)/0.06,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--color-gold)/0.03,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,var(--color-primary)/0.04,transparent_40%)]" />

      {/* Floating orbs */}
      <div className="pointer-events-none absolute top-1/4 right-[15%] h-64 w-64 rounded-full bg-gold/[0.03] blur-[80px]" />
      <div className="pointer-events-none absolute bottom-1/3 left-[10%] h-48 w-48 rounded-full bg-gold/[0.025] blur-[60px]" />

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-24 overflow-hidden">
        <div className="relative z-10 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 shadow-xl shadow-gold/10 animate-in zoom-in duration-500 delay-200">
            <Music className="h-9 w-9 text-gold" />
          </div>

          <p className="mb-4 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-gold/70">
            Biblioteca Espiritual Privada
          </p>

          <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Paz em Canção
          </h1>

          <div className="mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          <p className="mx-auto mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground/80">
            30 louvores inéditos que tocam a alma. Uma experiência exclusiva de
            adoração preparada com carinho para você.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { icon: Headphones, label: "Ouça online" },
              { icon: Download, label: "Baixe tudo" },
              { icon: Lock, label: "Acesso exclusivo" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-border/40 bg-card/40 backdrop-blur-sm px-5 py-2.5 text-sm text-muted-foreground/70 shadow-sm"
              >
                <Icon className="h-4 w-4 text-gold/70" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gold text-gold-foreground px-9 py-4 text-base font-bold shadow-xl shadow-gold/20 transition-all duration-300 hover:brightness-110 hover:shadow-2xl hover:shadow-gold/25 active:scale-[0.97]"
            >
              Acessar Minha Área
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <FooterLinks variant="minimal" />
    </div>
  );
}
