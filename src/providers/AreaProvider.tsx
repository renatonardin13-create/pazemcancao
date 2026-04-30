import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyAreas, getAreas, type Area } from "@/lib/areas.functions";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface AreaContextType {
  currentArea: Area | null;
  areas: Area[];
  isLoading: boolean;
  switchArea: (areaId: string) => void;
}

const AreaContext = createContext<AreaContextType | undefined>(undefined);

export function AreaProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [currentAreaId, setCurrentAreaId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("current_area_id");
    }
    return null;
  });

  const { data: areas = [], isLoading: areasLoading } = useQuery({
    queryKey: ["my-areas", user?.id],
    queryFn: isAdmin ? getAreas : getMyAreas,
    enabled: isAuthenticated,
  });

  const currentArea = areas.find((a) => a.id === currentAreaId) || areas[0] || null;

  useEffect(() => {
    if (currentArea && currentArea.id !== currentAreaId) {
      setCurrentAreaId(currentArea.id);
      localStorage.setItem("current_area_id", currentArea.id);
    }
  }, [currentArea, currentAreaId]);

  const switchArea = (areaId: string) => {
    setCurrentAreaId(areaId);
    localStorage.setItem("current_area_id", areaId);
  };

  return (
    <AreaContext.Provider
      value={{
        currentArea,
        areas,
        isLoading: areasLoading,
        switchArea,
      }}
    >
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  const context = useContext(AreaContext);
  if (context === undefined) {
    throw new Error("useArea must be used within an AreaProvider");
  }
  return context;
}
