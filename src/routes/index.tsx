import { createFileRoute, Link } from "@tanstack/react-router";
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
      <section className="relative flex-1 flex flex-col items-center justify-between overflow-hidden py-16">
        {/* Dark background */}
        <div className="absolute inset-0 bg-background" />

        {/* Musical note particles */}
        <MusicNoteParticles />

        {/* Top content: Logo + Text */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Logo */}
            <motion.div variants={fadeUp} custom={0.2} className="mb-8">
              <img
                src={logo}
                alt="Paz em Canção"
                className="h-[100px] sm:h-[130px] object-contain mx-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              />
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp} custom={0.5}>
              <div className="mx-auto h-px w-36 bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
            </motion.div>

            {/* Description text */}
            <motion.p
              variants={fadeUp}
              custom={0.7}
              className="mt-6 text-lg sm:text-xl text-muted-foreground/70 font-light tracking-wide max-w-md leading-relaxed"
            >
              Plataforma Completa com Música
              <br />
              & Conteúdos Espirituais
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom: CTA Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.0}
          className="relative z-10 mb-8"
        >
          <Link
            to="/login"
            className="inline-block px-12 py-5 rounded-full bg-[#FFA500] text-background font-bold text-base sm:text-lg tracking-wide uppercase shadow-[0_0_30px_rgba(255,165,0,0.3)] hover:shadow-[0_0_50px_rgba(255,165,0,0.5)] hover:scale-105 transition-all duration-500"
          >
            QUERO ACESSAR MEUS 30 LOUVORES AGORA
          </Link>
        </motion.div>
      </section>

      <FooterLinks variant="full" />
    </div>
  );
}
