import { PosterShelfRow, PosterShelfItem } from "@/components/PosterShelfRow";
import { VitrineCourseCard } from "./VitrineCourseCard";
import type { VitrineCourse } from "./types";

interface Props {
  title: string;
  courses?: VitrineCourse[] | null;
}

/**
 * Prateleira horizontal de cursos — usa o mesmo PosterShelfRow/Item
 * que os louvores e conteúdos para garantir tamanho 9:13 idêntico.
 */
export function ShelfRow({ title, courses }: Props) {
  const safeCourses = Array.isArray(courses)
    ? courses.filter((course): course is VitrineCourse => Boolean(course?.id))
    : [];

  if (!safeCourses.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="px-4 font-display text-xl font-bold text-foreground sm:px-8 lg:px-12">
        {title}
      </h2>

      <PosterShelfRow>
        {safeCourses.map((course, index) => (
          <PosterShelfItem key={course.id}>
            <VitrineCourseCard course={course} index={index} />
          </PosterShelfItem>
        ))}
      </PosterShelfRow>
    </section>
  );
}
