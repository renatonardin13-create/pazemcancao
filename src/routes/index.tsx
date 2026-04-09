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
            {/* Logo */}
            <motion.div variants={fadeUp} custom={0.4} className="mb-8">
              <img src={logo} alt="Paz em Canção" className="h-[150px] sm:h-[200px] object-contain mx-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.15)]" />
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


      <FooterLinks variant="full" />
    </div>
  );
}
