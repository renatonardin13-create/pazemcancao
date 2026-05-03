/**
 * Hook que devolve o conjunto de entitlements REAIS do usuário logado.
 * Fonte: tabela `enrollments` (status=active, expires_at > now).
 *
 * Usado pelo `resolveProductAccessState` no client quando precisamos
 * recalcular o estado de um produto sem ir ao servidor de novo.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { buildEntitlements, type UserEntitlements } from "@/lib/product-access";

interface EnrollmentRow {
  course_id: string;
  status: string;
  expires_at: string | null;
  granted_at: string | null;
}

const EMPTY_ENTITLEMENTS: UserEntitlements = { ownedCourseIds: new Set<string>() };

export function useUserEntitlements() {
  const { user } = useAuth();

  const query = useQuery({
    enabled: !!user?.id,
    queryKey: ["user-entitlements", user?.id],
    staleTime: 30_000,
    queryFn: async (): Promise<EnrollmentRow[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id, status, expires_at, granted_at")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (error) throw error;
      return (data || []) as EnrollmentRow[];
    },
  });

  const entitlements = useMemo<UserEntitlements>(
    () => (query.data ? buildEntitlements(query.data) : EMPTY_ENTITLEMENTS),
    [query.data],
  );

  return {
    entitlements,
    rows: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
