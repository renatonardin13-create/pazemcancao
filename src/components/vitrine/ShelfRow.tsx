import { VitrineCourseCard } from "./VitrineCourseCard";
import { POSTER_GRID } from "@/lib/card-grid";
import type { VitrineCourse } from "./types";

interface Props {
  title: string;
  courses?: VitrineCourse[] | null;
}

/**
 * Listagem de cursos em GRID 9:13 — mesmo padrão visual usado em
 * "Todos os louvores" e na vitrine, garantindo cards com tamanho idêntico
 * em toda a plataforma.
 */
export function ShelfRow({ title, courses }: Props) {
  const safeCourses = Array.isArray(courses)
    ? courses.filter((course): course is VitrineCourse => Boolean(course?.id))
    : [];

  if (!safeCourses.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>

      <div className={POSTER_GRID}>
        {safeCourses.map((course, index) => (
          <VitrineCourseCard key={course.id} course={course} index={index} />
        ))}
      </div>
    </section>
  );
}
