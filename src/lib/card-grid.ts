/**
 * Classe única para grids de cards 9:13 (TrackCard / ContentCard / CourseShelfCard).
 * Mantém largura, altura, alinhamento e gaps idênticos em toda a plataforma.
 *
 * Regra de colunas (premium, capa dominante):
 * - mobile  (<640px):  1 coluna
 * - tablet  (≥640px):  2 colunas
 * - desktop (≥1024px): 3 colunas
 * - wide    (≥1280px): 4 colunas
 *
 * Gaps simétricos: mesmo valor horizontal e vertical (gap-x === gap-y),
 * para que cards comecem sempre no mesmo eixo, sem "flutuar".
 *
 * Use sempre este token ao montar grades de cards de conteúdo
 * (home, /musicas, /bonus, /ebooks, /lancamentos, /trilhas, /conteudo).
 */
export const POSTER_GRID =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 items-start";

/**
 * Largura fixa para itens em prateleiras horizontais (carrosséis).
 * Espelha o tamanho do POSTER_GRID para que o usuário sinta a mesma
 * presença visual em grids verticais e em scroll horizontal.
 */
export const POSTER_SHELF_ITEM =
  "w-[200px] sm:w-[230px] md:w-[260px] lg:w-[280px] xl:w-[300px] shrink-0 snap-start";
