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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            to="/admin/courses"
            className="mt-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-border/20 bg-card/10 text-muted-foreground/50 hover:text-foreground/70 hover:border-border/40 transition-all shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-foreground/85 tracking-tight truncate">
              Gerenciar: {courseTitle}
            </h1>
            <p className="mt-0.5 text-[12px] text-muted-foreground/40">
              Gerencie detalhes, módulos e aulas do curso
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/admin/courses" })}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={mutation.isPending}
            onClick={() => formRef.current?.requestSubmit()}
          >
            {mutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1" />
            )}
            Salvar Curso
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/10 border border-border/15 w-full justify-start">
          <TabsTrigger value="details" className="text-xs">
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-xs">
            Módulos e Aulas
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="rounded-2xl border border-border/15 bg-card/5 p-6">
            <CourseForm
              ref={formRef}
              initialValues={course}
              onSubmit={(values) => mutation.mutate(values)}
              isSubmitting={mutation.isPending}
              hideSubmitButton
            />
          </div>
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
