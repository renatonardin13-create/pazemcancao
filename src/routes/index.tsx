import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FooterLinks } from "@/components/FooterLinks";
import logo from "@/assets/logo-paz-em-cancao.png";
import heroImg from "@/assets/hero-bg.png";
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

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Dark background */}
        <div className="absolute inset-0 bg-background" />

        {/* Musical note particles */}
        <MusicNoteParticles />

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl text-center px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Logo */}
            <motion.div variants={fadeUp} custom={0.2} className="mb-6">
              <img src={logo} alt="Paz em Canção" className="h-[100px] sm:h-[130px] object-contain mx-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.15)]" />
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp} custom={0.5}>
              <div className="mx-auto h-px w-36 bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
            </motion.div>

            {/* Hero Image with glow effect */}
            <motion.div variants={fadeUp} custom={0.7} className="mt-8 relative">
              {/* Glow layers */}
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-r from-gold/10 via-gold/20 to-gold/10 blur-[40px] opacity-60" />
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-gold/5 via-transparent to-gold/5 blur-[20px]" />
              
              <img
                src={heroImg}
                alt="Paz em Canção — Plataforma completa com 30 louvores inéditos"
                className="relative z-10 w-full max-w-[700px] sm:max-w-[800px] rounded-xl border border-gold/10 shadow-[0_0_80px_-20px_rgba(212,175,55,0.25)]"
              />
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} custom={1.0} className="mt-10">
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
              custom={1.3}
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
