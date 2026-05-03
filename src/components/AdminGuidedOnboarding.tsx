import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Layout, Settings, ShoppingCart, Zap, Box, Layers, Globe, ExternalLink, Sparkles, PartyPopper } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  completed: boolean;
  blocked?: boolean;
  blockingMessage?: string;
  nextStepLabel?: string;
}

interface AdminGuidedOnboardingProps {
  stats: {
    totalAreas: number;
    totalCategories: number;
    totalCourses: number;
    totalStudents: number;
    webhookActivated: boolean;
    webhookToken: string;
    gatewayConfigured: boolean;
  };
}

export function AdminGuidedOnboarding({ stats }: AdminGuidedOnboardingProps) {
  const steps: OnboardingStep[] = [
    {
      id: "area",
      title: "1. Criar área de membros",
      description: "Sua identidade visual e domínio próprio.",
      icon: Globe,
      path: "/admin/areas/new",
      completed: stats.totalAreas > 0,
      nextStepLabel: "Configurar marca"
    },
    {
      id: "section",
      title: "2. Criar seção",
      description: "Organize seus conteúdos por categorias.",
      icon: Layers,
      path: "/admin/categories",
      completed: stats.totalCategories > 0,
      blocked: stats.totalAreas === 0,
      blockingMessage: "Crie sua área de membros primeiro.",
      nextStepLabel: "Criar categoria"
    },
    {
      id: "product",
      title: "3. Criar produto",
      description: stats.totalAreas > 0 && stats.totalCourses === 0 
        ? "Você já criou sua área. Agora adicione seu primeiro produto."
        : "Adicione seu curso ou conteúdo principal.",
      icon: Box,
      path: "/admin/courses/new",
      completed: stats.totalCourses > 0,
      blocked: stats.totalCategories === 0,
      blockingMessage: "Crie pelo menos uma seção primeiro.",
      nextStepLabel: "Criar produto"
    },
    {
      id: "offer",
      title: "4. Criar oferta",
      description: stats.totalCourses > 0 
        ? "Seu produto está pronto. Agora conecte o pagamento para vender."
        : "Configure o preço e acesso do seu produto.",
      icon: ShoppingCart,
      path: "/admin/offers/new",
      completed: stats.gatewayConfigured, 
      blocked: stats.totalCourses === 0,
      blockingMessage: "Crie um produto primeiro.",
      nextStepLabel: "Criar oferta"
    },
    {
      id: "gateway",
      title: "5. Conectar pagamento",
      description: "Conecte com sua plataforma de vendas preferida.",
      icon: Settings,
      path: "/admin/integrations",
      completed: stats.gatewayConfigured,
      blocked: stats.totalCourses === 0,
      blockingMessage: "Configure um produto antes da integração.",
      nextStepLabel: "Conectar plataforma"
    },
    {
      id: "webhook",
      title: "6. Ativar liberação automática",
      description: "Garanta o acesso imediato dos alunos após a compra.",
      icon: Zap,
      path: "/admin/integrations",
      completed: stats.webhookActivated,
      blocked: !stats.webhookToken || !stats.gatewayConfigured,
      blockingMessage: "Defina uma chave de segurança e conecte seu pagamento.",
      nextStepLabel: "Ativar notificações"
    },
    {
      id: "access",
      title: "7. Liberar acesso",
      description: "Tudo pronto! Seus alunos receberão acesso automático.",
      icon: CheckCircle2,
      path: "/admin/users",
      completed: stats.totalStudents > 0,
      blocked: !stats.webhookActivated,
      blockingMessage: "Ative a liberação automática para facilitar o acesso.",
      nextStepLabel: "Ver alunos"
    },
  ];

  const currentStep = steps.find(s => !s.completed);
  const isFinished = !currentStep;
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="mb-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sua Jornada de Configuração</h2>
          <p className="text-sm text-muted-foreground">Complete os passos para transformar sua área em um negócio lucrativo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 md:w-64 h-2.5 bg-secondary/50 rounded-full overflow-hidden border border-border/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-gold/80 to-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
            />
          </div>
          <span className="text-sm font-bold text-gold tabular-nums">{completedCount}/{steps.length} concluídos</span>
          
          {stats.totalAreas > 0 && (
            <Link 
              to="/home"
              className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold/20 bg-gold/10 text-[10px] font-bold text-gold hover:bg-gold/20 transition-all"
            >
              <ExternalLink className="h-3 w-3" />
              Ver Vitrine
            </Link>
          )}
        </div>
      </div>

      {/* Destaque do próximo passo ou Celebração */}
      {isFinished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-emerald-500/5"
        >
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-[80px]" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-inner">
              <PartyPopper className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-[10px] font-black text-white uppercase tracking-tighter">
                  Configuração Concluída
                </span>
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">Parabéns! Sua plataforma está pronta.</h3>
              <p className="text-base text-muted-foreground/80 font-medium max-w-md leading-relaxed">
                Você concluiu todos os passos essenciais. Agora é só focar nas vendas e no conteúdo!
              </p>
            </div>
          </div>
          <div className="flex gap-3 relative z-10">
            <Link
              to="/admin/users"
              className="px-8 h-14 rounded-2xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
            >
              Gerenciar Alunos
              <ChevronRight className="h-6 w-6" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group overflow-hidden bg-gradient-to-br from-gold/15 via-gold/5 to-transparent border border-gold/25 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-gold/5"
        >
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gold/10 blur-[80px] group-hover:bg-gold/20 transition-all duration-700" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-gold/20 flex items-center justify-center text-gold border border-gold/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <currentStep.icon className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-gold text-[10px] font-black text-black uppercase tracking-tighter animate-pulse">
                  Próxima Ação
                </span>
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">{currentStep.title}</h3>
              <p className="text-base text-muted-foreground/80 font-medium max-w-md leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>
          <Link
            to={currentStep.path}
            className="w-full md:w-auto px-10 h-14 rounded-2xl bg-gold text-black font-black text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/30 hover:shadow-gold/40 relative z-10"
          >
            {currentStep.nextStepLabel}
            <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={step.blocked ? undefined : step.path}
              className={`group relative flex flex-col items-center text-center gap-3 p-4 rounded-xl border transition-all h-full ${
                step.completed 
                ? "bg-emerald-500/5 border-emerald-500/20" 
                : step.blocked
                ? "bg-secondary/20 border-border/10 cursor-not-allowed opacity-50"
                : "bg-card border-border hover:border-gold/50 shadow-sm"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                step.completed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-secondary border-border text-muted-foreground"
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <h3 className={`text-[11px] font-bold leading-tight ${step.completed ? "text-emerald-400/80" : "text-foreground"}`}>
                  {step.title.split('. ')[1]}
                </h3>
              </div>

              <div className="absolute top-2 right-2">
                {step.completed && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
