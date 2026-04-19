/**
 * Classe única para grids de cards 9:13 (TrackCard / ContentCard / CourseShelfCard).
 * Mantém largura, altura, alinhamento e gaps idênticos em toda a plataforma.
 *
 * Regra de colunas responsiva (cards mais compactos):
 * - mobile  (<480px):  2 colunas
 * - sm      (≥640px):  3 colunas
 * - md      (≥768px):  4 colunas
 * - lg      (≥1024px): 5 colunas
 * - xl      (≥1280px): 6 colunas
 * - 2xl     (≥1536px): 7 colunas
 *
 * Gaps simétricos e enxutos para acomodar mais cards por linha.
 */
export const POSTER_GRID =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-5 items-start justify-items-stretch w-full";

/**
 * Largura fixa para itens em prateleiras horizontais (carrosséis).
 * Cards mais compactos para caber mais por viewport e melhorar mobile.
 */
export const POSTER_SHELF_ITEM =
  "w-[140px] sm:w-[160px] md:w-[170px] lg:w-[180px] xl:w-[190px] shrink-0 snap-start";
