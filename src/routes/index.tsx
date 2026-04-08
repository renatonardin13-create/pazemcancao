import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, Lock, Download, Headphones } from "lucide-react";
import { FooterLinks } from "@/components/FooterLinks";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-gold)/0.08,transparent_70%)]" />

        <div className="relative z-10 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10 animate-in zoom-in duration-500 delay-200">
            <Music className="h-9 w-9 text-gold" />
          </div>

          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-gold">
            Biblioteca Espiritual Privada
          </p>

          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Paz em Canção
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            30 louvores inéditos que tocam a alma. Uma experiência exclusiva de
            adoração preparada com carinho para você.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: Headphones, label: "Ouça online" },
              { icon: Download, label: "Baixe tudo" },
              { icon: Lock, label: "Acesso exclusivo" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm text-muted-foreground shadow-sm"
              >
                <Icon className="h-4 w-4 text-gold" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:brightness-110"
            >
              Acessar Minha Área
            </Link>
          </div>
        </div>
      </section>

      <FooterLinks variant="minimal" />
    </div>
  );
}
