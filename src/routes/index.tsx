import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Music, ShieldCheck, Star } from "lucide-react";
import { FooterLinks } from "@/components/FooterLinks";
import logoIcon from "@/assets/logo-icon.png";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover object-[center_80%]" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background/90" />
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[20%] left-[15%] h-1 w-1 rounded-full bg-gold/20 animate-breathe" />
          <div className="absolute top-[35%] right-[20%] h-0.5 w-0.5 rounded-full bg-gold/15 animate-breathe" style={{ animationDelay: "2s" }} />
          <div className="absolute top-[45%] right-[35%] h-1 w-1 rounded-full bg-gold/15 animate-float-slow" />
        </div>

        {/* Logo */}
        <div className="relative z-20 pt-8 pb-4 animate-in fade-in duration-1000">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="Paz em Canção" className="h-8 w-8 object-contain" width={512} height={512} />
            <span className="font-display text-sm font-bold text-foreground/70 tracking-tight">
              Paz em Canção
            </span>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-lg text-center px-6 pt-16 sm:pt-24 animate-in fade-in slide-in-from-bottom-12 duration-[1600ms]">
          <div className="mx-auto mb-8 w-px h-20 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

          <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.6em] text-gold/55">
            Paz em forma de canção
          </p>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-tight text-foreground">
            Paz em <span className="text-gold">Canção</span>
          </h1>

          <div className="mx-auto mt-7 h-px w-28 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

          <p className="mx-auto mt-7 max-w-sm text-[15px] leading-[2.4] text-muted-foreground/70 font-light">
            30 louvores inéditos para momentos de{" "}
            <em className="text-foreground/85 not-italic font-medium">quietude</em>,{" "}
            <em className="text-foreground/85 not-italic font-medium">oração</em> e{" "}
            <em className="text-foreground/85 not-italic font-medium">presença</em>.
            Um refúgio sonoro para a sua caminhada de fé.
          </p>

          <div className="mt-12">
            <Link
              to="/login"
              className="group relative inline-flex items-center gap-3 rounded-full bg-gold/20 text-gold border border-gold/20 px-12 py-5 text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-500 hover:bg-gold/30 hover:border-gold/35 hover:shadow-[0_0_40px_-8px] hover:shadow-gold/20"
            >
              Acessar Meu Espaço
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
            </Link>
          </div>

          <p className="mt-6 text-[10px] text-muted-foreground/30 tracking-[0.2em]">
            Você não está sozinho nessa caminhada
          </p>
        </div>

        <div className="relative z-10 mt-auto pb-10 flex flex-col items-center gap-3 animate-in fade-in duration-1000 delay-1000">
          <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground/25">Conheça</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold/15 to-transparent animate-float-slow" />
        </div>
      </section>

      {/* Pillars */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,var(--color-gold)/0.02,transparent_70%)]" />

        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <div className="text-center mb-20">
            <Heart className="h-4 w-4 text-gold/40 mx-auto mb-5" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold/35 mb-5">
              Sua Biblioteca Espiritual
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground/85 tracking-tight leading-tight">
              Canções criadas para<br />nutrir a sua fé
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Music,
                title: "30 Louvores Inéditos",
                description: "Cada canção foi composta para ser um momento de encontro, oração e renovação espiritual.",
              },
              {
                icon: ShieldCheck,
                title: "Acesso Vitalício",
                description: "Ouça e baixe sempre que precisar. Seu espaço de adoração está sempre disponível, a qualquer hora.",
              },
              {
                icon: Star,
                title: "Qualidade Premium",
                description: "Áudio em alta qualidade para uma experiência imersiva. Feito com cuidado e respeito por cada nota.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-border/20 bg-card/15 backdrop-blur-sm p-8 text-center transition-all duration-700 hover:border-gold/15 hover:bg-card/25"
              >
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/[0.06] border border-gold/10 transition-colors duration-500 group-hover:bg-gold/[0.1]">
                  <item.icon className="h-5 w-5 text-gold/50" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground/80 tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-[2] text-muted-foreground/45 font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-12 w-px h-16 bg-gradient-to-b from-transparent via-gold/12 to-transparent" />

          <blockquote className="font-display text-xl sm:text-2xl font-semibold text-foreground/70 leading-[1.8] tracking-tight italic">
            "Essas canções se tornaram parte da minha rotina de oração.
            Sinto paz toda vez que ouço."
          </blockquote>

          <div className="mx-auto mt-8 h-px w-10 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

          <p className="mt-6 text-[11px] uppercase tracking-[0.4em] text-gold/30 font-medium">
            Uma ouvinte
          </p>
        </div>
      </section>

      {/* Community */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,var(--color-gold)/0.015,transparent_70%)]" />

        <div className="mx-auto max-w-xl px-6 text-center relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold/35 mb-5">
            Uma Rede de Fé
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground/80 tracking-tight leading-tight mb-6">
            Você não está sozinho
          </h2>
          <p className="text-[14px] leading-[2.4] text-muted-foreground/50 font-light">
            Pessoas de todo o Brasil encontraram nessas canções
            um espaço de paz, presença e renovação.
            Este também é o seu lugar.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,var(--color-gold)/0.025,transparent_70%)]" />

        <div className="mx-auto max-w-md px-6 text-center relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold/40 mb-5">
            Seu Espaço de Paz
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground/85 tracking-tight leading-tight mb-6">
            Comece a ouvir agora
          </h2>
          <p className="text-[14px] leading-[2.2] text-muted-foreground/50 font-light mb-10">
            Acesse seus 30 louvores e permita-se
            viver momentos de paz e presença.
          </p>

          <Link
            to="/login"
            className="group inline-flex items-center gap-3 rounded-full bg-gold/20 text-gold border border-gold/20 px-10 py-4 text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-500 hover:bg-gold/30 hover:border-gold/35 hover:shadow-[0_0_40px_-8px] hover:shadow-gold/20"
          >
            Acessar Meus Louvores
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </section>

      <FooterLinks variant="full" />
    </div>
  );
}
