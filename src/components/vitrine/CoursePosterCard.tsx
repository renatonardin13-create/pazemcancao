/**
 * CoursePosterCard — wrapper de compatibilidade.
 *
 * Mantido para imports antigos (CrossSell, etc.). Encaminha para o
 * VitrineCourseCard, que é o card-padrão da /home (PosterCard 5:8).
 *
 * Padronização: /home, /musicas e /cursos usam o mesmo PosterCard via
 * POSTER_GRID + VitrineCourseCard / TrackCard.
 */
import { VitrineCourseCard } from "./VitrineCourseCard";
import type { VitrineCourse } from "./types";

interface Props {
  course: VitrineCourse;
  index?: number;
}

export function CoursePosterCard({ course, index = 0 }: Props) {
  if (!course?.id) return null;
  return <VitrineCourseCard course={course} index={index} />;
}
