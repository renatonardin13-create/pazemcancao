import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CourseForm } from "@/components/CourseForm";
import { CourseIntegrationSection } from "@/components/CourseIntegrationSection";
import { getAdminCourse, updateCourse } from "@/lib/admin-courses.functions";
import { CourseModulesTab } from "@/components/CourseModulesTab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

export const Route = createFileRoute(
  "/_authenticated/admin/courses/$courseId"
)({
  component: EditCoursePage,
});

function EditCoursePage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState("details");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-course", courseId],
    queryFn: () => getAdminCourse({ data: { courseId } }),
  });

  const mutation = useMutation({
    mutationFn: (values: any) =>
      updateCourse({ data: { id: courseId, ...values } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-course", courseId] });
      toast.success("Curso atualizado com sucesso!");
      navigate({ to: "/admin/courses" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
          Carregando curso...
        </p>
      </div>
    );
  }

  const course = data?.course;
  const courseTitle = course?.title || "Curso";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card p-6 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4 min-w-0">
            <Link
              to="/admin/courses"
              className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-border/15 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-black text-foreground tracking-tight truncate">
                Gerenciar: <span className="text-gold">{courseTitle}</span>
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground/50">
                Gerencie detalhes, módulos e aulas do curso
              </p>
            </div>
          </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-border/20 text-muted-foreground/60 hover:text-foreground/80"
            onClick={() => navigate({ to: "/admin/courses" })}
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={mutation.isPending}
            className="bg-gold/90 text-gold-foreground hover:bg-gold shadow-lg shadow-gold/20 hover:shadow-gold/30 font-semibold"
            onClick={() => formRef.current?.requestSubmit()}
          >
            {mutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Salvar Curso
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/5 border border-border/10 w-full justify-start gap-1 p-1.5 rounded-xl h-auto">
          <TabsTrigger
            value="details"
            className="text-xs px-4 py-2 rounded-lg text-muted-foreground/50 data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm data-[state=active]:border-gold/20 data-[state=active]:border transition-all"
          >
            Detalhes
          </TabsTrigger>
          <TabsTrigger
            value="modules"
            className="text-xs px-4 py-2 rounded-lg text-muted-foreground/50 data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm data-[state=active]:border-gold/20 data-[state=active]:border transition-all"
          >
            Módulos e Aulas
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-xs px-4 py-2 rounded-lg text-muted-foreground/50 data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm data-[state=active]:border-gold/20 data-[state=active]:border transition-all"
          >
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <CourseForm
            ref={formRef}
            initialValues={course}
            onSubmit={(values) => mutation.mutate(values)}
            isSubmitting={mutation.isPending}
            hideSubmitButton
          />
        </TabsContent>

        <TabsContent value="modules" className="mt-6 space-y-6">
          {/* Status banner */}
          {course?.status === "published" ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-[13px] text-emerald-400 font-medium">
                Curso publicado e visível para os alunos
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-[13px] text-amber-400 font-medium">
                Curso em rascunho — não visível para os alunos
              </span>
            </div>
          )}
          <CourseModulesTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <CourseIntegrationSection courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
