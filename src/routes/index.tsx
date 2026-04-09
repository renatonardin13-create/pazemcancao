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

            {/* CTA Button */}
            <motion.div variants={fadeUp} custom={1.0} className="mt-10">
              <Link
                to="/login"
                className="inline-block px-10 py-4 rounded-full bg-gold text-background font-bold text-base sm:text-lg tracking-wide uppercase shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] hover:scale-105 transition-all duration-500"
              >
                QUERO ACESSAR MEUS 30 LOUVORES AGORA
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      <FooterLinks variant="full" />
    </div>
  );
}
