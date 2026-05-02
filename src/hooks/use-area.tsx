import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useArea() {
  const { data: area, isLoading } = useQuery({
    queryKey: ["current-area"],
    queryFn: async () => {
      if (typeof window === "undefined") return null;

      const hostname = window.location.hostname;
      // In development, hostname might be localhost or a preview URL.
      // We assume subdomains are the first part: subdomain.domain.com
      const parts = hostname.split(".");
      
      // If we are on a known dev hostname or have no subdomain, return null or a default area
      if (parts.length < 2 || hostname.includes("localhost") || hostname.includes("lovable.app")) {
        // You might want to return the 'principal' area here as a fallback
        const { data: principalArea } = await supabase
          .from("areas_membros")
          .select("*")
          .eq("principal", true)
          .maybeSingle();
        return principalArea;
      }

      const subdomain = parts[0];
      const { data, error } = await supabase
        .from("areas_membros")
        .select("*")
        .eq("subdominio", subdomain)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: Infinity, // Area info doesn't change often
  });

  return { area, isLoading };
}
