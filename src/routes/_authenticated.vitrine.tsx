import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentVitrineData } from "@/lib/student-vitrine.functions";
import { StudentLayout } from "@/components/StudentLayout";
import type { VitrineShelf } from "@/components/vitrine/types";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
  errorComponent: VitrineErrorFallback,
});

function VitrineErrorFallback({ error }: { error: Error }) {
  return (
    <StudentLayout>
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Não foi possível carregar a vitrine
        </h2>
        <p className="text-sm text-muted-foreground">
          {error?.message || "Ocorreu um erro inesperado. Tente novamente em instantes."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </button>
      </div>
    </StudentLayout>
  );
}

function VitrinePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-shelves", "v2"],
    queryFn: () => getStudentVitrineData(),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const shelves: VitrineShelf[] = Array.isArray(data?.shelves)
    ? (data.shelves as VitrineShelf[]).filter(
        (shelf) => shelf && typeof shelf.id === "string" && Array.isArray(shelf.courses),
      )
    : [];

  return (
    <ModuleGuard moduleKey="vitrine">
      <StudentLayout>
        <div className="min-h-screen bg-background px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <header className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-foreground">Vitrine</h1>
              <p className="text-sm text-muted-foreground">Rota carregada.</p>
            </header>

            {isError ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
                <div className="space-y-2">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Não foi possível carregar a vitrine
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {(error as Error)?.message || "Verifique sua conexão e tente novamente."}
                  </p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
                >
                  <RefreshCw className="h-4 w-4" /> Tentar novamente
                </button>
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-10">
                <p className="text-sm text-muted-foreground">Carregando vitrine...</p>
              </div>
            ) : shelves.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-10">
                <p className="text-sm text-muted-foreground">
                  Nenhuma prateleira disponível no momento.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {shelves.map((shelf) => {
                  const courses = Array.isArray(shelf.courses)
                    ? shelf.courses.filter((course) => course && typeof course.id === "string")
                    : [];

                  return (
                    <section
                      key={shelf.id}
                      className="space-y-4 rounded-2xl border border-border bg-card p-5"
                    >
                      <div className="space-y-1">
                        <h2 className="font-display text-xl font-semibold text-foreground">
                          {shelf.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {courses.length} produto{courses.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {courses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Esta prateleira está vazia.
                        </p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {courses.map((course) => {
                            const isOwned = course.access_state === "owned";

                            return (
                              <article
                                key={course.id}
                                className="flex min-h-[180px] flex-col justify-between rounded-xl border border-border bg-background p-4"
                              >
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-foreground">{course.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Categoria: {course.category_name || "Sem categoria"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Status: {isOwned ? "liberado" : "bloqueado"}
                                  </p>
                                </div>

                                <button
                                  onClick={() =>
                                    navigate({
                                      to: isOwned ? "/cursos/$courseId" : "/produto/$courseId",
                                      params: { courseId: course.id },
                                    })
                                  }
                                  className="mt-4 inline-flex w-fit items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
                                >
                                  {isOwned ? "Acessar" : "Ver detalhes"}
                                </button>
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
