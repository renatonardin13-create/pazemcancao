import { toastError } from "@/lib/toast-utils";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CourseForm } from "@/components/CourseForm";
import { createCourse } from "@/lib/admin-courses.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRef, useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/courses/new")({
  component: NewCoursePage,
});

function NewCoursePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState("detalhes");

  const mutation = useMutation({
    mutationFn: (values: any) => createCourse({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["student-shelves"] });
      toast.success("Curso criado com sucesso!");
      navigate({ to: "/admin/courses" });
    },
    onError: (e: Error) => toastError(e),
  });

  const handleSave = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card px-6 py-4 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-center justify-between relative z-10">
          {/* Left: back + title */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin/courses"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-black text-foreground tracking-tight">
                Criar Novo Curso
              </h1>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                Configure seu curso, adicione módulos e aulas
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/admin/courses" })}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Salvar Curso
            </Button>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/60 border border-border/25 p-1 rounded-xl">
          <TabsTrigger
            value="detalhes"
            className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-5"
          >
            Detalhes
          </TabsTrigger>
          <TabsTrigger
            value="modulos"
            className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-5"
          >
            Módulos e Aulas
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-5"
          >
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="mt-4">
          <CourseForm
            ref={formRef}
            onSubmit={(values) => mutation.mutate(values)}
            isSubmitting={mutation.isPending}
            hideSubmitButton
          />
        </TabsContent>

        <TabsContent value="modulos" className="mt-4">
          <div className="rounded-2xl border border-border/30 bg-card p-6 shadow-lg shadow-black/10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Módulos e Aulas</h3>
                <p className="text-sm text-muted-foreground/50 mt-0.5">
                  Organize a estrutura do seu curso de forma hierárquica
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                + Criar Módulo
              </Button>
            </div>
            <div className="rounded-xl border border-dashed border-gold/30 bg-gold/[0.03] p-8 text-center">
              <p className="text-sm text-muted-foreground/60">
                Salve o curso primeiro para gerenciar módulos e aulas.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <div className="rounded-2xl border border-border/30 bg-card p-8 shadow-lg shadow-black/10 text-center">
            <p className="text-sm text-muted-foreground/50">
              Salve o curso primeiro para acessar as configurações avançadas.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
