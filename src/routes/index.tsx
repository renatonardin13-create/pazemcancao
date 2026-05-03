import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FooterLinks } from "@/components/FooterLinks";
import logo from "@/assets/logo-paz-em-cancao.png";
import heroImg from "@/assets/hero-bg.jpg";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { MusicNoteParticles } from "@/components/MusicNoteParticles";


export const Route = createFileRoute("/")({
  component: LandingPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay },
  }),
};

function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: "/home" });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex flex-col relative overflow-hidden">
      <section className="relative flex-1 flex flex-col items-center justify-between py-8 sm:py-16">
        
        <MusicNoteParticles />

        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 mt-4 sm:mt-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeUp} custom={0.05} className="mb-4 sm:mb-8">
              <img
                src={logo}
                alt="Paz em Canção"
                className="h-[70px] sm:h-[130px] object-contain mx-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={0.15}>
              <div className="mx-auto h-px w-36 bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.25}
            className="mt-4 sm:mt-8 relative group"
          >
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-r from-gold/5 via-gold/8 to-gold/5 blur-[40px] opacity-40" />
            
            <div className="absolute -inset-[2px] rounded-xl z-10 overflow-hidden">
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'conic-gradient(from var(--neon-angle, 0deg), transparent 0%, rgba(212,175,55,0.8) 10%, transparent 20%, transparent 80%, rgba(212,175,55,0.8) 90%, transparent 100%)',
                  animation: 'neonSpin 3s linear infinite',
                }}
              />
            </div>
            
            <img
              src={heroImg}
              alt="Paz em Canção — Plataforma completa com 30 louvores inéditos"
              className="relative z-20 w-full max-w-[280px] sm:max-w-[600px] md:max-w-[800px] rounded-xl border border-gold/10 shadow-[0_0_60px_-20px_rgba(212,175,55,0.15)]"
            />
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.4}
          className="relative z-10 mb-6 sm:mb-8 mt-6 sm:mt-16 px-6"
        >
          <Link
            to="/login"
            className="inline-block w-full sm:w-auto text-center px-6 sm:px-12 py-3.5 sm:py-5 rounded-full bg-[hsl(32_82%_58%)] text-background font-bold text-xs sm:text-lg tracking-wide uppercase shadow-[0_0_30px_rgba(234,153,61,0.28)] hover:shadow-[0_0_50px_rgba(234,153,61,0.42)] hover:scale-105 transition-all duration-300"
          >
            QUERO ACESSAR MEUS 30 LOUVORES AGORA
          </Link>
        </motion.div>
      </section>

      <FooterLinks variant="full" />
    </div>
  );
}
