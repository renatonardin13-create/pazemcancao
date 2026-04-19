import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { SafeBoundary } from "@/components/SafeBoundary";
import { getStudentShelves } from "@/lib/shelves.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { VitrinePageContent } from "@/components/vitrine/VitrinePageContent";
import type { VitrineShelf } from "@/components/vitrine/types";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
  errorComponent: VitrineErrorFallback,
});

function VitrineErrorFallback({ error }: { error: Error }) {
  return (
    <StudentLayout>
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/60" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Não foi possível carregar a vitrine
        </h2>
        <p className="text-sm text-muted-foreground/70">
          {error?.message || "Ocorreu um erro inesperado. Tente novamente em instantes."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/20"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </button>
      </div>
    </StudentLayout>
  );
}

function VitrinePage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-shelves", "v2"],
    queryFn: () => getStudentShelves(),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Defensive: nunca passar undefined/null adiante
  const shelves: VitrineShelf[] = Array.isArray(data?.shelves)
    ? (data!.shelves as VitrineShelf[]).filter(
        (shelf) => shelf && Array.isArray(shelf.courses),
      )
    : [];
  const featuredCourse = data?.featuredCourse ?? null;

  useEffect(() => {
    console.log("[DEBUG][VITRINE] routeComponent=VitrinePage");
    console.log("[DEBUG][VITRINE] isLoading=", isLoading, "isError=", isError);
    if (isError) console.error("[VITRINE] query error:", error);
  }, [isLoading, isError, error]);

  return (
    <ModuleGuard moduleKey="vitrine">
      <StudentLayout>
        <SafeBoundary fallbackTitle="Erro ao renderizar a vitrine">
          {isError ? (
            <div className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/60" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Não foi possível carregar a vitrine
              </h2>
              <p className="text-sm text-muted-foreground/70">
                {(error as Error)?.message ||
                  "Verifique sua conexão e tente novamente."}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/20"
              >
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </button>
            </div>
          ) : (
            <VitrinePageContent
              shelves={shelves}
              featuredCourse={featuredCourse}
              isLoading={isLoading}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
          )}
        </SafeBoundary>
      </StudentLayout>
    </ModuleGuard>
  );
}
