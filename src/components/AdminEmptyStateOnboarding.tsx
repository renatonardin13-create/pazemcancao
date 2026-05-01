import { motion } from "framer-motion";
import { Globe, BookOpen, CreditCard, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AdminEmptyStateOnboarding() {
  const steps = [
    {
      icon: Globe,
      title: "Criar área de membros",
      description: "Sua identidade visual e domínio próprio",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      icon: BookOpen,
      title: "Adicionar conteúdo",
      description: "Organize seus cursos e seções",
      color: "bg-gold/10 text-gold border-gold/20",
    },
    {
      icon: CreditCard,
      title: "Conectar pagamento",
      description: "Integração direta com gateways",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full space-y-12 text-center"
      >
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-black uppercase tracking-widest text-gold mb-4"
          >
            <Sparkles className="h-3 w-3" /> Bem-vindo ao seu novo SaaS
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-tight">
            Comece sua plataforma em <span className="text-gold animate-pulse">poucos passos</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Configure sua área de membros e comece a vender hoje mesmo. Tudo o que você precisa em um único lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-500/20 via-gold/20 to-emerald-500/20 -z-10" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="relative flex flex-col items-center p-6 rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm group hover:border-gold/30 transition-all duration-300 shadow-xl shadow-black/10"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${step.color} mb-6 shadow-lg`}>
                <step.icon className="h-8 w-8" />
              </div>
              <span className="absolute top-4 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-[10px] font-black">
                {index + 1}
              </span>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8"
        >
          <Link
            to="/admin/settings"
            className="group relative inline-flex items-center justify-center h-16 px-10 rounded-2xl bg-gold text-black font-black text-lg hover:shadow-2xl hover:shadow-gold/30 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Começar agora
            <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">
            Leve menos de 2 minutos para configurar
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
