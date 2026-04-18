import { Store, Search } from "lucide-react";
import { useMemo, useEffect } from "react";
import { FooterLinks } from "@/components/FooterLinks";
import { Input } from "@/components/ui/input";
import { VitrineFeaturedBanner } from "./VitrineFeaturedBanner";
import { VitrineShelfSection } from "./VitrineShelfSection";
import type { VitrineShelf, VitrineCourse } from "./types";

interface VitrinePageContentProps {
  shelves: VitrineShelf[];
  featuredCourse?: VitrineCourse | null;
  isLoading: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export function VitrinePageContent({
  shelves,
  featuredCourse,
  isLoading,
  searchTerm,
  onSearchTermChange,
}: VitrinePageContentProps) {
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

  useEffect(() => {
    const cardsRendered = filteredShelves.reduce((total, shelf) => total + shelf.courses.length, 0);
    console.log("[DEBUG][VITRINE] component=VitrinePageContent");
    console.log("[DEBUG][VITRINE] shelvesReturned=", shelves.length);
    console.log("[DEBUG][VITRINE] shelfNames=", shelves.map((shelf) => shelf.name));
    console.log(
      "[DEBUG][VITRINE] coursesPerShelf=",
      shelves.map((shelf) => ({ name: shelf.name, count: shelf.courses.length })),
    );
    console.log(
      "[DEBUG][VITRINE] filters=",
      shelves.map((shelf) => ({
        name: shelf.name,
        beforeDedup: shelf.courses.length,
        afterFilter:
          filteredShelves.find((filteredShelf) => filteredShelf.id === shelf.id)?.courses.length ?? 0,
      })),
    );
    console.log("[DEBUG][VITRINE] cardsRendered=", cardsRendered);
  }, [filteredShelves, shelves]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-8 sm:px-8 sm:pt-10 lg:px-12">
        <div className="mb-6 flex animate-in items-center gap-3 fade-in slide-in-from-bottom-4 duration-600 sm:mb-8">
          <Store className="h-7 w-7 text-gold" />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
              Vitrine
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground/50">
              Todas as prateleiras publicadas do admin, organizadas em linhas horizontais.
            </p>
          </div>
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Buscar cursos..."
            className="h-10 border-border/30 bg-card/20 pl-9 text-sm backdrop-blur-sm"
          />
        </div>
      </div>

      {featuredCourse ? <VitrineFeaturedBanner course={featuredCourse} /> : null}

      {isLoading ? (
        <div className="py-24 text-center">
          <p className="animate-pulse text-xs uppercase tracking-[0.4em] text-muted-foreground/60">
            Carregando vitrine...
          </p>
        </div>
      ) : filteredShelves.length === 0 ? (
        <div className="py-24 text-center">
          <Store className="mx-auto mb-5 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground/70">
            {searchTerm
              ? "Nenhum curso encontrado para esta busca."
              : "Nenhum conteúdo disponível na vitrine no momento."}
          </p>
        </div>
      ) : (
        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {filteredShelves.map((shelf) => (
            <VitrineShelfSection key={shelf.id} shelf={shelf} />
          ))}
        </div>
      )}

      <FooterLinks />
    </div>
  );
}