import { Clock } from "lucide-react";
import { PosterShelfItem, PosterShelfRow } from "@/components/PosterShelfRow";
import { VitrineCourseCard } from "./VitrineCourseCard";
import { POSTER_GRID } from "@/lib/card-grid";
import type { VitrineShelf } from "./types";

interface VitrineShelfSectionProps {
  shelf: VitrineShelf;
}

export function VitrineShelfSection({ shelf }: VitrineShelfSectionProps) {
  const courses = Array.isArray(shelf.courses)
    ? shelf.courses.filter(
        (course) =>
          course &&
          typeof course.id === "string" &&
          typeof course.title === "string" &&
          course.title.trim().length > 0,
      )
    : [];

  if (!courses.length) return null;

  // Resolve display mode: auto = grid quando <4, carrossel quando >=4
  const mode = shelf.display_mode ?? "auto";
  const useGrid = mode === "grid" || (mode === "auto" && courses.length < 4);

  const heading = (shelf.public_title?.trim() || shelf.name) ?? "Prateleira";

  const renderCard = (course: VitrineShelf["courses"][number], index: number) => {
    const isComingSoon = course.access_state === "coming_soon";
    return (
      <VitrineCourseCard
        course={course}
        index={index}
        badge={
          isComingSoon && course.badge_text ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500/95 to-orange-500/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-black shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
              <Clock className="h-2.5 w-2.5" />
              {course.badge_text}
            </span>
          ) : course.is_featured ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gradient-to-r from-gold/95 to-amber-400/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-black shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
              ★ Destaque
            </span>
          ) : undefined
        }
      />
    );
  };

  return (
    <section className="space-y-7 sm:space-y-9">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/90 tracking-tight">
            {heading}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/15 to-transparent" />
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/45">
            {courses.length} card{courses.length !== 1 ? "s" : ""}
          </span>
        </div>
        {shelf.description ? (
          <p className="mt-1.5 text-[12px] sm:text-[13px] text-muted-foreground/60 max-w-2xl">
            {shelf.description}
          </p>
        ) : null}
      </div>

      {useGrid ? (
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
          <div className={POSTER_GRID}>
            {courses.map((course, index) => (
              <div key={`${shelf.id}-${course.id}`}>{renderCard(course, index)}</div>
            ))}
          </div>
        </div>
      ) : (
        <PosterShelfRow>
          {courses.map((course, index) => (
            <PosterShelfItem key={`${shelf.id}-${course.id}`}>
              {renderCard(course, index)}
            </PosterShelfItem>
          ))}
        </PosterShelfRow>
      )}
    </section>
  );
}
