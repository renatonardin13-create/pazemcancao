import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Music, ShieldCheck, Star, Headphones } from "lucide-react";
import { FooterLinks } from "@/components/FooterLinks";
import logo from "@/assets/logo-paz-em-cancao.png";
import heroBg from "@/assets/hero-bg.jpg";
import { motion } from "framer-motion";
import { MusicNoteParticles } from "@/components/MusicNoteParticles";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt=""
            className="h-full w-full object-cover object-[center_75%] scale-105"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
        </div>

        {/* Musical note particles */}
        <MusicNoteParticles />

        {/* Top nav removed per PRD — no header elements above hero */}

        {/* Hero content */}
        <div className="relative z-10 max-w-xl text-center px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Cross icon */}
            <motion.div variants={fadeUp} custom={0.4} className="mb-8">
              <img src={logo} alt="Paz em Canção" className="h-20 sm:h-28 object-contain mx-auto" />
            </motion.div>


            {/* Divider */}

            {/* Divider */}
            <motion.div variants={fadeUp} custom={1}>
              <div className="mx-auto mt-8 h-px w-36 bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={1.1}
              className="mx-auto mt-8 max-w-md text-base sm:text-[17px] leading-[2.2] text-muted-foreground/70 font-light"
            >
              30 louvores inéditos criados para quem precisa
              <em className="text-foreground/90 not-italic font-medium"> respirar Deus</em> outra vez.
              <br />
              <span className="text-muted-foreground/50">Para dias em que só Ele entende.</span>
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} custom={1.4} className="mt-14">
              <Link
                to="/login"
                className="group relative inline-flex items-center gap-3 rounded-full bg-gold/20 text-gold border border-gold/25 px-14 py-5 text-[12px] font-bold tracking-[0.25em] uppercase transition-all duration-700 hover:bg-gold/30 hover:border-gold/40 hover:shadow-[0_0_60px_-12px] hover:shadow-gold/25 active:scale-[0.97]"
              >
                <span>Acessar Meu Espaço</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </Link>
            </motion.div>

            {/* Sub-CTA */}
            <motion.p
              variants={fadeUp}
              custom={1.7}
              className="mt-7 text-[10px] text-muted-foreground/35 tracking-[0.25em] font-light"
            >
              Você não está sozinho nessa caminhada
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ EMOTIONAL BRIDGE ═══════════════════ */}
      <section className="relative py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,var(--color-gold)/0.02,transparent_70%)]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-2xl px-6 text-center relative z-10"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="mx-auto mb-10 w-px h-20 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={0.15}
            className="text-[10px] font-semibold uppercase tracking-[0.6em] text-gold/40 mb-8"
          >
            Para quem está ferido, mas não desistiu
          </motion.p>

          <motion.h2
            variants={fadeUp}
            custom={0.3}
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground/90 leading-[1.35] tracking-tight"
          >
            Existem noites em que a mente não para.
            <br />
            <span className="text-gold/80">Estas canções são para essas noites.</span>
          </motion.h2>

          <motion.div variants={fadeUp} custom={0.45}>
            <div className="mx-auto mt-10 h-px w-20 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={0.6}
            className="mt-10 text-[15px] leading-[2.4] text-muted-foreground/55 font-light max-w-md mx-auto"
          >
            Um bálsamo para a alma. Cada faixa foi composta
            como um ato de cuidado — para quem precisa
            de paz em forma de canção.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══════════════════ PILLARS ═══════════════════ */}
      <section className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,var(--color-gold)/0.015,transparent_70%)]" />

        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Heart className="h-4 w-4 text-gold/45 mx-auto mb-5" />
            </motion.div>
            <motion.p variants={fadeUp} custom={0.1} className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold/40 mb-5">
              O Que Você Vai Encontrar
            </motion.p>
            <motion.h2 variants={fadeUp} custom={0.2} className="font-display text-3xl sm:text-4xl font-bold text-foreground/90 tracking-tight leading-tight">
              Uma experiência criada<br />com propósito
            </motion.h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Music,
                title: "30 Louvores Inéditos",
                description: "Canções autorais compostas como atos de oração. Cada nota carrega intenção, cada palavra foi escolhida com cuidado.",
                highlight: "Composições exclusivas",
              },
              {
                icon: Headphones,
                title: "Áudio em Alta Qualidade",
                description: "Produção profissional com fidelidade sonora. Para que cada momento de adoração seja uma experiência imersiva e completa.",
                highlight: "Qualidade premium",
              },
              {
                icon: ShieldCheck,
                title: "Acesso Vitalício & Seguro",
                description: "Ouça e baixe a qualquer hora. Seu espaço pessoal de adoração está sempre disponível, protegido e pronto para você.",
                highlight: "Sempre disponível",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={scaleIn}
                custom={i * 0.15}
                className="group relative rounded-2xl border border-border/15 bg-card/10 backdrop-blur-sm p-9 text-center transition-all duration-700 hover:border-gold/15 hover:bg-card/20 overflow-hidden"
              >
                <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gold/[0.02] blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/[0.06] border border-gold/10 transition-all duration-500 group-hover:bg-gold/[0.1] group-hover:scale-105">
                    <item.icon className="h-5 w-5 text-gold/55" />
                  </div>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-gold/40 mb-3">
                    {item.highlight}
                  </p>

                  <h3 className="font-display text-lg font-bold text-foreground/85 tracking-tight mb-4">
                    {item.title}
                  </h3>

                  <p className="text-[13px] leading-[2.1] text-muted-foreground/45 font-light">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIAL ═══════════════════ */}
      <section className="relative py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-2xl px-6 text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="mx-auto mb-10 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-gold/40 fill-gold/30" />
              ))}
            </div>
          </motion.div>

          <motion.blockquote
            variants={fadeUp}
            custom={0.2}
            className="font-display text-xl sm:text-2xl lg:text-[1.7rem] font-semibold text-foreground/75 leading-[1.9] tracking-tight italic"
          >
            "Essas canções se tornaram parte da minha rotina de oração.
            Coloco para tocar nas madrugadas difíceis e sinto uma paz que não consigo explicar."
          </motion.blockquote>

          <motion.div variants={fadeUp} custom={0.35}>
            <div className="mx-auto mt-8 h-px w-10 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          </motion.div>

          <motion.div variants={fadeUp} custom={0.45} className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold/35 font-semibold">
              Fernanda M.
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/25 tracking-wider">
              Ouvinte desde 2025
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ COMMUNITY ═══════════════════ */}
      <section className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,var(--color-gold)/0.02,transparent_70%)]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto max-w-xl px-6 text-center relative z-10"
        >
          <motion.p variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold/40 mb-6">
            Uma Rede de Fé
          </motion.p>
          <motion.h2 variants={fadeUp} custom={0.15} className="font-display text-2xl sm:text-3xl font-bold text-foreground/85 tracking-tight leading-tight mb-7">
            Somos uma comunidade<br />de adoradores
          </motion.h2>
          <motion.p variants={fadeUp} custom={0.3} className="text-[15px] leading-[2.4] text-muted-foreground/50 font-light">
            Pessoas de todo o Brasil encontraram nessas canções
            um espaço de refúgio, presença e renovação.
            <span className="block mt-3 text-foreground/60 font-medium">Este também é o seu lugar.</span>
          </motion.p>

          <motion.div variants={fadeUp} custom={0.45} className="mt-12 flex items-center justify-center gap-8">
            {[
              { value: "30", label: "Louvores" },
              { value: "∞", label: "Acesso" },
              { value: "♡", label: "Propósito" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-gold/60">{stat.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="relative py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,var(--color-gold)/0.03,transparent_70%)]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto max-w-md px-6 text-center relative z-10"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="mx-auto mb-8 w-px h-16 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
          </motion.div>

          <motion.p variants={fadeUp} custom={0.1} className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gold/45 mb-5">
            Seu Espaço de Paz
          </motion.p>

          <motion.h2 variants={fadeUp} custom={0.2} className="font-display text-3xl sm:text-4xl font-bold text-foreground/90 tracking-tight leading-tight mb-6">
            Comece a ouvir<br />agora mesmo
          </motion.h2>

          <motion.p variants={fadeUp} custom={0.35} className="text-[15px] leading-[2.2] text-muted-foreground/50 font-light mb-12">
            Acesse seus 30 louvores e permita-se
            viver momentos de paz e presença divina.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.5}>
            <Link
              to="/login"
              className="group relative inline-flex items-center gap-3 rounded-full bg-gold/20 text-gold border border-gold/25 px-12 py-5 text-[12px] font-bold tracking-[0.25em] uppercase transition-all duration-700 hover:bg-gold/30 hover:border-gold/40 hover:shadow-[0_0_60px_-12px] hover:shadow-gold/25 active:scale-[0.97]"
            >
              Acessar Meus Louvores
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} custom={0.65} className="mt-8 text-[10px] text-muted-foreground/25 tracking-wider">
            Acesso imediato após a compra · Suporte dedicado
          </motion.p>
        </motion.div>
      </section>

      <FooterLinks variant="full" />
    </div>
  );
}
