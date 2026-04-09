import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CourseForm } from "@/components/CourseForm";
import { createCourse } from "@/lib/admin-courses.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/courses/new")({
  component: NewCoursePage,
});

function NewCoursePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: any) => createCourse({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Curso criado com sucesso!");
      navigate({ to: "/admin/courses" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
          Novo Curso
        </h1>
      </div>

      <CourseForm
        onSubmit={(values) => mutation.mutate(values)}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}
