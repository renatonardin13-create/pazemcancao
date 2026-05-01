import { motion } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, BookOpen, Layout, Settings, Users, Music } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  completed: boolean;
}

interface AdminGuidedOnboardingProps {
  stats: {
    totalCourses: number;
    totalCategories: number;
    totalTracks: number;
    totalStudents: number;
  };
}

export function AdminGuidedOnboarding({ stats }: AdminGuidedOnboardingProps) {
  const steps: OnboardingStep[] = [
    {
      id: "course",
      title: "Crie seu primeiro curso",
      description: "Comece adicionando seu conteúdo principal para seus alunos.",
      icon: BookOpen,
      path: "/admin/courses/new",
      completed: stats.totalCourses > 0,
    },
    {
      id: "category",
      title: "Organize por categorias",
      description: "Facilite a navegação dos alunos agrupando seus conteúdos.",
      icon: Layout,
      path: "/admin/categories",
      completed: stats.totalCategories > 0,
    },
    {
      id: "tracks",
      title: "Adicione faixas ou materiais",
      description: "Complemente seus cursos com materiais de apoio ou áudios.",
      icon: Music,
      path: "/admin/tracks",
      completed: stats.totalTracks > 0,
    },
    {
      id: "students",
      title: "Convide seus alunos",
      description: "Agora que tudo está pronto, é hora de trazer seu público.",
      icon: Users,
      path: "/admin/users",
      completed: stats.totalStudents > 0,
    },
    {
      id: "settings",
      title: "Personalize sua plataforma",
      description: "Ajuste as cores, logo e configurações da sua área de membros.",
      icon: Settings,
      path: "/admin/settings",
      completed: true, // Assuming default settings are there, or could check actual settings
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Prepare sua plataforma</h2>
          <p className="text-sm text-muted-foreground">Siga os passos abaixo para deixar tudo pronto para seus alunos.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={step.path}
              className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                step.completed 
                ? "bg-card/40 border-gold/20 grayscale-[0.5] hover:grayscale-0" 
                : "bg-card border-border hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5"
              }`}
            >
              <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                step.completed ? "bg-gold/10 border-gold/20 text-gold" : "bg-secondary border-border text-muted-foreground group-hover:text-gold transition-colors"
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 min-w-0 pr-6">
                <h3 className={`text-sm font-bold truncate ${step.completed ? "text-foreground/70" : "text-foreground"}`}>
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {step.description}
                </p>
              </div>

              <div className="absolute top-4 right-4">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-gold/50 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
