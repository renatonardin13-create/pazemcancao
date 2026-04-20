/**
 * Classe única para grids de cards 5:9 (TrackCard / ContentCard / CourseShelfCard).
 * Mantém largura, altura, alinhamento e gaps idênticos em toda a plataforma.
 *
 * Cards GRANDES — referência 300x540px (proporção 5:9).
 * Regra de colunas responsiva (presença visual forte):
 * - mobile  (<640px):  2 colunas
 * - sm      (≥640px):  3 colunas
 * - md      (≥768px):  3 colunas
 * - lg      (≥1024px): 4 colunas
 * - xl      (≥1280px): 5 colunas
 * - 2xl     (≥1536px): 6 colunas
 */
export const POSTER_GRID =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 items-start justify-items-stretch w-full";

/**
 * Largura fixa para itens em prateleiras horizontais (carrosséis).
 * Cards GRANDES com mesma presença visual da grid — referência 300px no desktop.
 */
export const POSTER_SHELF_ITEM =
  "w-[180px] sm:w-[210px] md:w-[240px] lg:w-[270px] xl:w-[290px] 2xl:w-[300px] shrink-0 snap-start";
