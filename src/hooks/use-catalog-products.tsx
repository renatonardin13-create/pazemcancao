/**
 * Hook EXCLUSIVO da Vitrine.
 * Lê todos os produtos publicados e visíveis no catálogo, já com
 * `product_access_state` resolvido pelo servidor (fonte única de verdade).
 *
 * NÃO consulta role admin. NÃO mistura biblioteca do aluno.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getStudentVitrineData } from "@/lib/student-vitrine.functions";
// useArea removed
import type { VitrineCourse, VitrineShelf } from "@/components/vitrine/types";

export function useCatalogProducts() {
  // currentArea removed

  const query = useQuery({
    queryKey: ["catalog-products", "v1"],
    queryFn: () => getStudentVitrineData({ data: {} }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const safeShelves: VitrineShelf[] = useMemo(
    () => {
      const rawShelves = Array.isArray(query.data?.shelves) ? query.data.shelves : [];

      return rawShelves.flatMap((shelf) => {
        if (!shelf || !Array.isArray(shelf.courses)) return [];
        return [shelf as VitrineShelf];
      });
    },
    [query.data],
  );

  const products: VitrineCourse[] = useMemo(() => {
    const seen = new Set<string>();
    const out: VitrineCourse[] = [];
    for (const shelf of safeShelves) {
      for (const c of shelf.courses) {
        if (seen.has(c.id)) continue;
        seen.add(c.id);
        out.push(c);
      }
    }
    return out;
  }, [safeShelves]);

  return {
    products,
    shelves: safeShelves,
    featured: query.data?.featuredCourse,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
