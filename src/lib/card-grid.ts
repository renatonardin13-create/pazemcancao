/**
 * Padrão único de cards 5:9 (300x540 no desktop) em toda a plataforma.
 *
 * Aplicado em: TrackCard, ContentCard, CourseShelfCard, VitrineCourseCard,
 * "Em destaque", "Seus Cursos", "Recentemente acessados", "Continuar assistindo".
 *
 * Regras:
 *  - aspect-ratio fixo 5/9 (definido no PosterCard)
 *  - largura mínima por breakpoint (cards nunca encolhem)
 *  - mobile/tablet reduzem proporcionalmente, mantendo 5:9
 *
 * Largura por breakpoint (referência 300px no desktop):
 *  - mobile  (<640px):  160px
 *  - sm      (≥640px):  190px
 *  - md      (≥768px):  220px
 *  - lg      (≥1024px): 250px
 *  - xl      (≥1280px): 280px
 *  - 2xl     (≥1536px): 300px
 */

/** Grid responsiva: cards com largura mínima fixa, nunca esmagados pelo grid. */
export const POSTER_GRID =
  "grid gap-4 sm:gap-5 lg:gap-6 items-start justify-items-stretch w-full " +
  "[grid-template-columns:repeat(auto-fill,minmax(160px,1fr))] " +
  "sm:[grid-template-columns:repeat(auto-fill,minmax(190px,1fr))] " +
  "md:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] " +
  "lg:[grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] " +
  "xl:[grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] " +
  "2xl:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]";

/** Item de prateleira horizontal: largura fixa, não encolhe. */
export const POSTER_SHELF_ITEM =
  "w-[160px] sm:w-[190px] md:w-[220px] lg:w-[250px] xl:w-[280px] 2xl:w-[300px] " +
  "shrink-0 grow-0 basis-auto snap-start";
