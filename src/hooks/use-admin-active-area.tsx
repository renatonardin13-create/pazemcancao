import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminActiveArea = {
  id: string;
  nome: string;
  subdominio: string;
  principal: boolean;
  ativa: boolean;
};

export function useAdminActiveArea() {
  const [activeAreaId, setActiveAreaId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("area_ativa_id");
    }
    return null;
  });

  const { data: areas, isLoading } = useQuery({
    queryKey: ["admin-areas-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("areas_membros")
        .select("id, nome, subdominio, principal, ativa")
        .order("nome");
      if (error) throw error;
      return data as AdminActiveArea[];
    },
  });

  const activeArea = areas?.find((a) => a.id === activeAreaId && a.ativa) || 
                     areas?.find((a) => a.principal && a.ativa) || 
                     areas?.find((a) => a.ativa) || 
                     areas?.[0];

  useEffect(() => {
    if (activeArea && activeArea.id !== activeAreaId) {
      setActiveAreaId(activeArea.id);
      localStorage.setItem("area_ativa_id", activeArea.id);
    }
  }, [activeArea, activeAreaId]);

  const setArea = (id: string) => {
    setActiveAreaId(id);
    localStorage.setItem("area_ativa_id", id);
    // Force a reload of queries that depend on the active area
    // This will be handled by the queryClient.invalidateQueries in the components
    // but setting the state here is the first step.
  };

  return {
    activeArea,
    areas,
    isLoading,
    setArea,
  };
}
