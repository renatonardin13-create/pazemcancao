import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
// removed translation hook
import { AlertCircle, RefreshCw, Loader2, ChevronRight } from "lucide-react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentVitrineData } from "@/lib/student-vitrine.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { HeroBanner } from "@/components/vitrine/HeroBanner";
import { VitrineCourseCard } from "@/components/vitrine/VitrineCourseCard";
import { ContinueWatchingSection } from "@/components/ContinueWatchingSection";
import type { VitrineShelf, VitrineCourse } from "@/components/vitrine/types";
import { CardScopeProvider } from "@/hooks/use-cards-config";

export const Route = createFileRoute("/_authenticated/home")({
  component: VitrinePageWithScope,
  errorComponent: VitrineErrorFallback,
});

function VitrinePageWithScope() {
  return (
    <CardScopeProvider scope="home">
      <VitrinePage />
    </CardScopeProvider>
  );
}

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
  const t = (k: string) => k === 'catalog' ? 'Catálogo' : k === 'no_content' ? 'Nenhum conteúdo disponível no momento.' : k;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-shelves", "v5-streaming", undefined],
    queryFn: () => getStudentVitrineData(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const allShelves: VitrineShelf[] = useMemo(
    () =>
      Array.isArray(data?.shelves)
        ? (data!.shelves as VitrineShelf[]).filter(
            (s) => s && typeof s.id === "string" && Array.isArray(s.courses) && s.courses.length > 0,
          )
        : [],
    [data],
  );

  const featured = (data?.featuredCourse as VitrineCourse | null) || null;
  const heroBanners = Array.isArray((data as any)?.heroBanners) ? (data as any).heroBanners : [];

  const hasAnyContent = allShelves.length > 0 || !!featured || heroBanners.length > 0;

  return (
    <ModuleGuard moduleKey="vitrine">
      <StudentLayout>
        <div className="min-h-screen bg-[#0b0b0b]">
          {isError ? (
            <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 py-20 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold text-white">
                Não foi possível carregar a vitrine
              </h2>
              <p className="text-sm text-white/40">
                {(error as Error)?.message || "Verifique sua conexão e tente novamente."}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : !hasAnyContent ? (
            <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <h1 className="font-display text-3xl font-bold text-white">{t('catalog')}</h1>
              <p className="text-sm text-white/40">
                {t('no_content')}
              </p>
            </div>
          ) : (
            <>
              {(heroBanners.length > 0 || featured) && (
                <HeroBanner banners={heroBanners} fallbackCourse={featured} />
              )}

              <div className="space-y-16 pb-32 pt-8">
                <ContinueWatchingSection />

                {/* Prateleiras de Conteúdo - Estilo Streaming Premium */}
                {allShelves.map((shelf, shelfIndex) => (
                  <section 
                    key={shelf.id} 
                    className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                    style={{ animationDelay: `${shelfIndex * 200}ms`, animationFillMode: 'both' }}
                  >
                    <div className="mb-6 flex items-end justify-between border-l-4 border-gold pl-4">
                      <div className="space-y-1">
                        <h2 className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl uppercase tracking-[0.1em]">
                          {shelf.public_title || shelf.name}
                        </h2>
                        {shelf.description && (
                          <p className="text-xs sm:text-sm text-white/30 max-w-2xl line-clamp-1 font-medium">
                            {shelf.description}
                          </p>
                        )}
                      </div>
                      {shelf.courses.length > 5 && (
                        <button className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-gold transition-all duration-300 group flex items-center gap-2">
                          Explorar tudo <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </button>
                      )}
                    </div>

                    <div className="scrollbar-hide -mx-4 flex gap-6 overflow-x-auto px-4 pb-12 sm:mx-0 sm:px-0">
                      {shelf.courses.map((course, index) => (
                        <div key={course.id} className="w-[280px] shrink-0 sm:w-[320px] lg:w-[420px]">
                          <VitrineCourseCard 
                            course={course} 
                            index={index + shelfIndex * 10} 
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
