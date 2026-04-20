import { Store, Search } from "lucide-react";
import { useEffect, useMemo } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FooterLinks } from "@/components/FooterLinks";
import { Input } from "@/components/ui/input";
import { VitrineFeaturedBanner } from "./VitrineFeaturedBanner";
import { VitrineShelfSection } from "./VitrineShelfSection";
import type { VitrineCourse, VitrineShelf } from "./types";

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

        const courses = term
          ? dedupedCourses.filter((course) =>
              [course.title, course.short_description, course.sales_description]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
            )
          : dedupedCourses;

        return { ...shelf, courses };
      })
      .filter((shelf) => shelf.courses.length > 0);
  }, [safeShelves, searchTerm]);

  // (debug logs removidos para produção)

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
          <div className="mx-auto w-full max-w-[1400px] space-y-10 px-4 sm:px-8 lg:px-12">
            {[0, 1].map((row) => (
              <div key={row} className="space-y-4">
                <div className="h-5 w-48 animate-pulse rounded bg-card/40" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4 lg:gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[9/13] animate-pulse rounded-2xl bg-card/40"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredShelves.length === 0 ? (
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
            <EmptyState
              icon={Store}
              title={searchTerm ? "Nenhum curso encontrado" : "Sua vitrine está vazia"}
              description={
                searchTerm
                  ? "Tente buscar por outro nome."
                  : "Quando houver cursos publicados, eles aparecerão aqui."
              }
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
