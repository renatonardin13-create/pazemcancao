import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentVitrineData } from "@/lib/student-vitrine.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { HeroBanner } from "@/components/vitrine/HeroBanner";
import { ShelfRow } from "@/components/vitrine/ShelfRow";
import type { VitrineShelf, VitrineCourse } from "@/components/vitrine/types";

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
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-shelves", "v3-netflix"],
    queryFn: () => getStudentVitrineData(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const shelves: VitrineShelf[] = Array.isArray(data?.shelves)
    ? (data.shelves as VitrineShelf[]).filter(
        (shelf) => shelf && typeof shelf.id === "string" && Array.isArray(shelf.courses) && shelf.courses.length > 0,
      )
    : [];

  const featured = (data?.featuredCourse as VitrineCourse | null) || null;

  return (
    <ModuleGuard moduleKey="vitrine">
      <StudentLayout>
        <div className="min-h-screen bg-background">
          {isError ? (
            <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 py-20 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Não foi possível carregar a vitrine
              </h2>
              <p className="text-sm text-muted-foreground">
                {(error as Error)?.message || "Verifique sua conexão e tente novamente."}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
              >
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : shelves.length === 0 && !featured ? (
            <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground">Vitrine</h1>
              <p className="text-sm text-muted-foreground">
                Nenhum conteúdo disponível no momento. Volte em breve.
              </p>
            </div>
          ) : (
            <>
              {featured && <HeroBanner course={featured} />}
              <div className="space-y-10 py-8 sm:py-12">
                {shelves.map((shelf) => (
                  <ShelfRow key={shelf.id} title={shelf.name} courses={shelf.courses} />
                ))}
              </div>
            </>
          )}
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
