import { Store, Search } from "lucide-react";
import { useMemo, useEffect } from "react";
import { FooterLinks } from "@/components/FooterLinks";
import { EmptyState } from "@/components/EmptyState";
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
  const safeShelves = useMemo(
    () =>
      (Array.isArray(shelves) ? shelves : []).filter(
        (shelf) => shelf && typeof shelf.id === "string" && Array.isArray(shelf.courses),
      ),
    [shelves],
  );

  const filteredShelves = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return [...safeShelves]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((shelf) => {
        const dedupedCourses = Array.from(
          new Map(
            (shelf.courses || [])
              .filter((course) => course && typeof course.id === "string")
              .map((course) => [course.id, course]),
          ).values(),
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
      .filter((shelf) => Array.isArray(shelf.courses) && shelf.courses.length > 0);
  }, [safeShelves, searchTerm]);

  useEffect(() => {
    const cardsRendered = filteredShelves.reduce((total, shelf) => total + shelf.courses.length, 0);
    console.log("[DEBUG][VITRINE] component=VitrinePageContent");
    console.log("[DEBUG][VITRINE] shelvesReturned=", safeShelves.length);
    console.log("[DEBUG][VITRINE] shelfNames=", safeShelves.map((shelf) => shelf.name));
    console.log(
      "[DEBUG][VITRINE] coursesPerShelf=",
      safeShelves.map((shelf) => ({ name: shelf.name, count: shelf.courses.length })),
    );
    console.log(
      "[DEBUG][VITRINE] filters=",
      safeShelves.map((shelf) => ({
        name: shelf.name,
        beforeDedup: shelf.courses.length,
        afterFilter:
          filteredShelves.find((filteredShelf) => filteredShelf.id === shelf.id)?.courses.length ?? 0,
      })),
    );
    console.log("[DEBUG][VITRINE] cardsRendered=", cardsRendered);
  }, [filteredShelves, safeShelves]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-8 sm:px-8 sm:pt-10 lg:px-12">
        <div className="flex animate-in items-center gap-3 fade-in slide-in-from-bottom-4 duration-600">
          <Store className="h-7 w-7 text-gold" />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
              Vitrine
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground/50">
              Cursos liberados e disponíveis para explorar.
            </p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Buscar cursos..."
            className="h-10 border-border/30 bg-card/20 pl-9 text-sm backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="space-y-12 pb-28 sm:space-y-16 lg:space-y-20">
        {featuredCourse && typeof featuredCourse.id === "string" ? (
          <VitrineFeaturedBanner course={featuredCourse} />
        ) : null}

        {isLoading ? (
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
            <EmptyState
              icon={Store}
              title="Carregando vitrine"
              description="Estamos preparando seus cursos e prateleiras."
            />
          </div>
        ) : filteredShelves.length === 0 ? (
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
            <EmptyState
              icon={Store}
              title={searchTerm ? "Nenhum curso encontrado" : "Sua vitrine está vazia"}
              description={searchTerm ? "Tente buscar por outro nome." : "Quando houver cursos publicados, eles aparecerão aqui."}
            />
          </div>
        ) : (
          filteredShelves.map((shelf) => <VitrineShelfSection key={shelf.id} shelf={shelf} />)
        )}
      </div>

      <FooterLinks />
    </div>
  );
}