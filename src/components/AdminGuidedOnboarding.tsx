import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Layout, Settings, ShoppingCart, Zap, Box, Layers, Globe } from "lucide-react";
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
      description: "Adicione seu curso ou conteúdo principal.",
      icon: Box,
      path: "/admin/courses/new",
      completed: stats.totalCourses > 0,
      blocked: stats.totalCategories === 0,
      blockingMessage: "Crie pelo menos uma seção primeiro.",
      nextStepLabel: "Adicionar curso"
    },
    {
      id: "offer",
      title: "4. Criar oferta",
      description: "Configure o preço e acesso do seu produto.",
      icon: ShoppingCart,
      path: "/admin/courses",
      completed: stats.totalCourses > 0, // Simplified: if product exists, assume offer config
      blocked: stats.totalCourses === 0,
      blockingMessage: "Crie um produto primeiro.",
      nextStepLabel: "Configurar vendas"
    },
    {
      id: "gateway",
      title: "5. Configurar gateway",
      description: "Conecte com Hotmart, Kiwify ou Cakto.",
      icon: Settings,
      path: "/admin/integrations",
      completed: stats.gatewayConfigured,
      blocked: stats.totalCourses === 0,
      blockingMessage: "Configure um produto antes da integração.",
      nextStepLabel: "Conectar plataforma"
    },
    {
      id: "webhook",
      title: "6. Ativar webhook",
      description: "Receba notificações de vendas em tempo real.",
      icon: Zap,
      path: "/admin/integrations",
      completed: stats.webhookActivated,
      blocked: !stats.webhookToken || !stats.gatewayConfigured,
      blockingMessage: "Gere um token de segurança e configure o gateway.",
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
      blockingMessage: "Ative o webhook para automação completa.",
      nextStepLabel: "Ver alunos"
    },
  ];

  const currentStep = steps.find(s => !s.completed) || steps[steps.length - 1];
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fluxo de Configuração</h2>
          <p className="text-sm text-muted-foreground">Complete os passos lineares para ativar sua plataforma de vendas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 md:w-48 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gold"
            />
          </div>
          <span className="text-sm font-bold text-gold">{completedCount}/{steps.length} concluídos</span>
        </div>
      </div>

      {/* Destaque do próximo passo */}
      {!currentStep.completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gold/10 border border-gold/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center text-gold">
              <currentStep.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gold uppercase tracking-wider">Próximo Passo</p>
              <h3 className="text-lg font-bold text-foreground">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            </div>
          </div>
          <Link
            to={currentStep.path}
            className="w-full md:w-auto px-6 h-12 rounded-xl bg-gold text-black font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-gold/20"
          >
            {currentStep.nextStepLabel}
            <ChevronRight className="h-4 w-4" />
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
                ? "bg-card/40 border-gold/20 grayscale-[0.5]" 
                : step.blocked
                ? "bg-secondary/20 border-border/10 cursor-not-allowed opacity-50"
                : "bg-card border-border hover:border-gold/50"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                step.completed ? "bg-gold/10 border-gold/20 text-gold" : "bg-secondary border-border text-muted-foreground"
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <h3 className={`text-[11px] font-bold leading-tight ${step.completed ? "text-foreground/70" : "text-foreground"}`}>
                  {step.title.split('. ')[1]}
                </h3>
              </div>

              <div className="absolute top-2 right-2">
                {step.completed && (
                  <CheckCircle2 className="h-4 w-4 text-gold" />
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
