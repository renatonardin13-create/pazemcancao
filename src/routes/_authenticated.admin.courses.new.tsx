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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card p-6 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/courses"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/15 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
                Novo Curso
              </h1>
              <p className="text-xs text-muted-foreground/50 mt-0.5">Preencha os dados para criar um novo curso</p>
            </div>
          </div>
        </div>
      </div>

      <CourseForm
        onSubmit={(values) => mutation.mutate(values)}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}
