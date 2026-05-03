import { createFileRoute, Link } from "@tanstack/react-router";
import { FooterLinks } from "@/components/FooterLinks";
import logo from "@/assets/logo-paz-em-cancao.png";
import heroImg from "@/assets/hero-bg.jpg";
import { motion } from "framer-motion";

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
      <section className="relative flex-1 flex flex-col items-center justify-between overflow-hidden py-8 sm:py-16">
        <div className="absolute inset-0 bg-background" />

        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 mt-4 sm:mt-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeUp} custom={0.2} className="mb-4 sm:mb-8">
              <img
                src={logo}
                alt="Paz em Canção"
                className="h-[70px] sm:h-[130px] object-contain mx-auto"
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={0.5}>
              <div className="mx-auto h-px w-36 bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.9}
            className="mt-4 sm:mt-8 relative"
          >
            <img
              src={heroImg}
              alt="Paz em Canção"
              className="relative z-20 w-full max-w-[280px] sm:max-w-[600px] md:max-w-[800px] rounded-xl border border-gold/10 shadow-2xl"
            />
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.0}
          className="relative z-10 mb-6 sm:mb-8 mt-6 sm:mt-16 px-6"
        >
          <Link
            to="/login"
            className="inline-block w-full sm:w-auto text-center px-6 sm:px-12 py-3.5 sm:py-5 rounded-full bg-gold text-background font-bold text-xs sm:text-lg tracking-wide uppercase shadow-xl hover:scale-105 transition-all duration-500"
          >
            QUERO ACESSAR MEUS 30 LOUVORES AGORA
          </Link>
        </motion.div>
      </section>

      <FooterLinks />
    </div>
  );
}