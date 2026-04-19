import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CoursePosterCard } from "./CoursePosterCard";
import type { VitrineCourse } from "./types";

interface Props {
  title: string;
  courses?: VitrineCourse[] | null;
}

export function ShelfRow({ title, courses }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const safeCourses = Array.isArray(courses)
    ? courses.filter((course): course is VitrineCourse => Boolean(course?.id))
    : [];

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [safeCourses.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!safeCourses.length) return null;

  return (
    <section className="group/shelf relative space-y-3">
      <h2 className="px-4 font-display text-xl font-bold text-foreground sm:px-8 lg:px-12">
        {title}
      </h2>

      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur transition-opacity duration-200 hover:bg-primary hover:text-primary-foreground group-hover/shelf:opacity-100 sm:flex"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-4 sm:px-8 lg:px-12"
        >
          {safeCourses.map((course) => (
            <CoursePosterCard key={course.id} course={course} />
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur transition-opacity duration-200 hover:bg-primary hover:text-primary-foreground group-hover/shelf:opacity-100 sm:flex"
            aria-label="Próximo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </section>
  );
}
