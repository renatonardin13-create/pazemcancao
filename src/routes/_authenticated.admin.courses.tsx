import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminCourses, deleteCourse } from "@/lib/admin-courses.functions";
import { Plus, Video, BookText, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => listAdminCourses(),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteCourse({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Curso excluído com sucesso");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const courses = data?.courses || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Cursos
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/40">
            Gerencie seus cursos
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/admin/courses/new">
            <Plus className="h-4 w-4 mr-1" />
            Novo Curso
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
            Carregando...
          </p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-border/15 bg-card/5">
          <Video className="h-10 w-10 text-muted-foreground/15 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/40">
            Nenhum curso cadastrado.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link to="/admin/courses/new">
              <Plus className="h-4 w-4 mr-1" />
              Criar primeiro curso
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/15 overflow-hidden">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-border/8 last:border-0 hover:bg-card/10 transition-colors"
            >
              {/* Icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/15 shrink-0">
                {course.cover_image_url ? (
                  <img
                    src={course.cover_image_url}
                    alt=""
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                ) : course.course_type === "video" ? (
                  <Video className="h-5 w-5 text-gold/40" />
                ) : (
                  <BookText className="h-5 w-5 text-blue-400/40" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground/80 truncate">
                  {course.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground/30">
                    {course.course_type === "video" ? "Vídeo" : "eBook"}
                  </span>
                  {course.categories?.name && (
                    <>
                      <span className="text-muted-foreground/15">·</span>
                      <span className="text-[11px] text-muted-foreground/30">
                        {course.categories.name}
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground/15">·</span>
                  <span className="text-[11px] text-muted-foreground/30">
                    R$ {Number(course.price).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status */}
              <Badge
                variant="outline"
                className={`text-[9px] rounded-full px-2 border ${
                  course.status === "published"
                    ? "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8"
                    : course.status === "draft"
                      ? "text-gold/50 border-gold/12 bg-gold/8"
                      : "text-muted-foreground/30 border-border/20"
                }`}
              >
                {course.status === "published"
                  ? "Publicado"
                  : course.status === "draft"
                    ? "Rascunho"
                    : "Arquivado"}
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <Link
                    to="/admin/courses/$courseId"
                    params={{ courseId: course.id }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive/50 hover:text-destructive"
                  onClick={() => {
                    if (confirm("Tem certeza que deseja excluir este curso?")) {
                      deleteM.mutate(course.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
