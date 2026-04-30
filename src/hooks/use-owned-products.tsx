/**
 * Hook EXCLUSIVO de "Meus Cursos".
 * Lê apenas produtos com entitlement REAL e ativo (status=active, não expirado).
 *
 * NÃO usa role admin para liberar nada.
 * NÃO consulta o catálogo.
 */
import { useQuery } from "@tanstack/react-query";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { useArea } from "@/providers/AreaProvider";

export function useOwnedProducts() {
  const { currentArea } = useArea();

  const query = useQuery({
    queryKey: ["owned-products", "v2-access-state", currentArea?.id],
    queryFn: () => getMyCoursesData({ data: { areaId: currentArea?.id } }),
    staleTime: 30_000,
  });

  return {
    products: query.data?.courses || [],
    stats: query.data?.stats || { total: 0, inProgress: 0, completed: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
