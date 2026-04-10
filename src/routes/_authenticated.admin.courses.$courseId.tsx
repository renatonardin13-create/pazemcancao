import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CourseForm } from "@/components/CourseForm";
import { CourseIntegrationSection } from "@/components/CourseIntegrationSection";
import { getAdminCourse, updateCourse } from "@/lib/admin-courses.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/admin/courses/$courseId"
)({
  component: EditCoursePage,
});

function EditCoursePage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
          Editar Curso
        </h1>
      </div>

      <CourseForm
        initialValues={data?.course}
        onSubmit={(values) => mutation.mutate(values)}
        isSubmitting={mutation.isPending}
      />

      <CourseIntegrationSection courseId={courseId} />
    </div>
  );
}
  );
}
