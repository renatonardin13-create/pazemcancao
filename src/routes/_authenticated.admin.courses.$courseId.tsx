import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CourseForm } from "@/components/CourseForm";
import { CourseIntegrationSection } from "@/components/CourseIntegrationSection";
import { getAdminCourse, updateCourse } from "@/lib/admin-courses.functions";
import { CourseModulesTab } from "@/components/CourseModulesTab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, X } from "lucide-react";
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-border/10">
        <div className="flex items-start gap-4 min-w-0">
          <Link
            to="/admin/courses"
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl border border-gold/15 bg-gold/5 text-gold/60 hover:text-gold hover:bg-gold/10 hover:border-gold/30 transition-all shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-foreground/90 tracking-tight truncate">
              Gerenciar: <span className="text-gold/80">{courseTitle}</span>
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground/45 tracking-wide">
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

        <TabsContent value="modules" className="mt-6">
          <div className="rounded-2xl border border-border/15 bg-card/5 p-6">
            <CourseModulesTab courseId={courseId} />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <CourseIntegrationSection courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
