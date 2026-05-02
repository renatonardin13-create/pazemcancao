import { useEffect } from "react";
import { useArea } from "@/hooks/use-area";

export function AreaBrandingProvider({ children }: { children: React.ReactNode }) {
  const { area } = useArea();

  useEffect(() => {
    if (area) {
      const root = document.documentElement;
      if (area.primary_color) {
        root.style.setProperty("--gold", area.primary_color);
        // Also update the hsl version if needed, but many components use the hex variable
        // If the theme uses HSL, we might need a converter.
        // Let's check how --gold is defined in the project.
      }
      // If there are other variables to override, do it here.
    }
  }, [area]);

  return <>{children}</>;
}
