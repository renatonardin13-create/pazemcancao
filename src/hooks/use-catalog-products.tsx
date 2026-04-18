/**
 * Hook EXCLUSIVO da Vitrine.
 * Lê todos os produtos publicados e visíveis no catálogo, já com
 * `product_access_state` resolvido pelo servidor (fonte única de verdade).
 *
 * NÃO consulta role admin. NÃO mistura biblioteca do aluno.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getStudentShelves } from "@/lib/shelves.functions";
import type { VitrineCourse } from "@/components/vitrine/types";

export function useCatalogProducts() {
  const query = useQuery({
    queryKey: ["catalog-products", "v1"],
    queryFn: () => getStudentShelves(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const products: VitrineCourse[] = useMemo(() => {
    const seen = new Set<string>();
    const out: VitrineCourse[] = [];
    for (const shelf of query.data?.shelves || []) {
      for (const c of shelf.courses) {
        if (seen.has(c.id)) continue;
        if (c.product_access_state === "hidden") continue;
        seen.add(c.id);
        out.push(c);
      }
    }
    return out;
  }, [query.data]);

  return {
    products,
    shelves: query.data?.shelves || [],
    featured: query.data?.featuredCourse,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
