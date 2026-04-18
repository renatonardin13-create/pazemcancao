import { Clock } from "lucide-react";
import { PosterShelfItem, PosterShelfRow } from "@/components/PosterShelfRow";
import { VitrineCourseCard } from "./VitrineCourseCard";
import type { VitrineShelf } from "./types";

interface VitrineShelfSectionProps {
  shelf: VitrineShelf;
}

export function VitrineShelfSection({ shelf }: VitrineShelfSectionProps) {
  if (!shelf.courses.length) return null;

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/90 tracking-tight">
            {shelf.name}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/15 to-transparent" />
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/45">
            {shelf.courses.length} card{shelf.courses.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <PosterShelfRow>
        {shelf.courses.map((course, index) => {
          const isComingSoon = course.access_state === "coming_soon";

          return (
            <PosterShelfItem key={`${shelf.id}-${course.id}`}>
              <VitrineCourseCard
                course={course}
                index={index}
                badge={
                  isComingSoon && course.badge_text ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500/95 to-orange-500/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-black shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
                      <Clock className="h-2.5 w-2.5" />
                      {course.badge_text}
                    </span>
                  ) : undefined
                }
              />
            </PosterShelfItem>
          );
        })}
      </PosterShelfRow>
    </section>
  );
}