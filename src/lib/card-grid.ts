/**
 * Classe única para grids de cards 9:13 (TrackCard / ContentCard / CourseShelfCard).
 * Mantém largura, altura e gaps idênticos em toda a plataforma.
 *
 * Direção premium: cards GRANDES com presença visual.
 * - Mobile: 2 colunas (capa dominante)
 * - Tablet: 3 colunas
 * - Desktop: 4 colunas
 * - Wide: 5 colunas (limite máximo — nunca menor que isso)
 *
 * Use sempre este token ao montar grades de cards de conteúdo
 * (home, /musicas, /bonus, /ebooks, /lancamentos, /trilhas, /conteudo).
 */
export const POSTER_GRID =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6";

/**
 * Largura fixa para itens em prateleiras horizontais (carrosséis).
 * Espelha o tamanho do POSTER_GRID para que o usuário sinta a mesma
 * presença visual em grids verticais e em scroll horizontal.
 */
export const POSTER_SHELF_ITEM =
  "w-[170px] sm:w-[200px] md:w-[230px] lg:w-[250px] xl:w-[270px] shrink-0 snap-start";
