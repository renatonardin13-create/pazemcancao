import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentShelves } from "@/lib/shelves.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { Store, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { VitrineFeaturedBanner } from "@/components/vitrine/VitrineFeaturedBanner";
import { VitrineShelfSection } from "@/components/vitrine/VitrineShelfSection";
import type { VitrineShelf } from "@/components/vitrine/types";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
});

function VitrinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-shelves", "v2"],
    queryFn: () => getStudentShelves(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const shelves: VitrineShelf[] = data?.shelves || [];
  const featuredCourse = data?.featuredCourse;

  const filteredShelves = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return [...shelves]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((shelf) => {
        const dedupedCourses = Array.from(
          new Map((shelf.courses || []).map((course) => [course.id, course])).values(),
        );

        const courses = !term
          ? dedupedCourses
          : dedupedCourses.filter((course) =>
              [course.title, course.short_description, course.sales_description]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term)),
            );

        return { ...shelf, courses };
      })
      .filter((shelf) => shelf.courses.length > 0);
  }, [shelves, searchTerm]);

  // 🔍 LOGS TEMPORÁRIOS — validação da vitrine (remover depois do QA)
  useEffect(() => {
    if (import.meta.env.PROD) return;
    if (isLoading) return;

    const allRenderedIds: string[] = [];
    const duplicates: string[] = [];

    console.groupCollapsed(
      `%c[/vitrine • VitrinePage] ${filteredShelves.length} prateleira(s) carregada(s)`,
      "color:#d4af37;font-weight:bold",
    );
    console.log("rota:", "/vitrine");
    console.log("componente:", "src/routes/_authenticated.vitrine.tsx > VitrinePage");
    console.log("nomes das prateleiras:", filteredShelves.map((shelf) => shelf.name));

    filteredShelves.forEach((shelf) => {
      const courses = shelf.courses || [];
      console.groupCollapsed(
        `📚 ${shelf.name} — ${courses.length} curso(s)`,
      );
      console.log("cards renderizados na prateleira:", courses.length);
      courses.forEach((c) => {
        const today = new Date();
        const launch = c.launch_date ? new Date(c.launch_date) : null;
        const notLaunched = launch && launch > today;
        const purchased = !!c.is_enrolled;
        const state = purchased
          ? "LIBERADO"
          : notLaunched
            ? "NAO_LANCADO"
            : "BLOQUEADO";
        const dup = allRenderedIds.includes(c.id);
        if (dup) duplicates.push(c.id);
        allRenderedIds.push(c.id);
        console.log(
          `  ${state === "LIBERADO" ? "✅" : state === "NAO_LANCADO" ? "🕒" : "🔒"} ${c.title}`,
          { id: c.id, state, duplicate: dup },
        );
      });
      console.groupEnd();
    });
    console.log(
      `%cTotal renderizado: ${allRenderedIds.length} | Únicos: ${new Set(allRenderedIds).size} | Duplicados: ${duplicates.length}`,
      duplicates.length ? "color:#ef4444;font-weight:bold" : "color:#22c55e",
    );
    if (duplicates.length) console.warn("⚠️ IDs duplicados:", duplicates);
    console.groupEnd();
  }, [filteredShelves, isLoading]);

  return (
    <ModuleGuard moduleKey="vitrine">
        <StudentLayout>
          <div className="min-h-screen bg-background pb-28">
            <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-8 sm:px-8 sm:pt-10 lg:px-12">
              <div className="mb-6 flex items-center gap-3 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
                <Store className="h-7 w-7 text-gold" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                    Vitrine
                  </h1>
                  <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                    Todas as prateleiras publicadas do admin, organizadas em linhas horizontais.
                  </p>
                </div>
              </div>
              <div className="relative max-w-sm mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="pl-9 bg-card/20 border-border/30 text-sm h-10 backdrop-blur-sm"
                />
              </div>
            </div>

            {featuredCourse ? <VitrineFeaturedBanner course={featuredCourse} /> : null}

            {isLoading ? (
              <div className="text-center py-24">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
                  Carregando vitrine...
                </p>
              </div>
            ) : filteredShelves.length === 0 ? (
              <div className="text-center py-24">
                <Store className="h-10 w-10 text-muted-foreground/50 mx-auto mb-5" />
                <p className="text-sm text-muted-foreground/70">
                  {searchTerm ? "Nenhum curso encontrado para esta busca." : "Nenhum conteúdo disponível na vitrine no momento."}
                </p>
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-12">
                {filteredShelves.map((shelf) => (
                  <VitrineShelfSection key={shelf.id} shelf={shelf} />
                ))}
              </div>
            )}

            <FooterLinks />
          </div>
        </StudentLayout>
      </ModuleGuard>
  );
}
