import { useEffect } from "react";
import { useArea } from "@/hooks/use-area";

export function AreaBrandingProvider({ children }: { children: React.ReactNode }) {
  const { area } = useArea();

  useEffect(() => {
    if (area) {
      const root = document.documentElement;
      
      // Update colors
      if (area.primary_color) {
        root.style.setProperty("--gold", area.primary_color);
        root.style.setProperty("--primary", area.primary_color);
        root.style.setProperty("--ring", area.primary_color);
        root.style.setProperty("--sidebar-primary", area.primary_color);
      }

      if (area.secondary_color) {
        root.style.setProperty("--secondary", area.secondary_color);
      }

      if (area.background_color) {
        root.style.setProperty("--background", area.background_color);
        root.style.setProperty("--sidebar", area.background_color);
      }

      if (area.surface_color) {
        root.style.setProperty("--card", area.surface_color);
        root.style.setProperty("--popover", area.surface_color);
        root.style.setProperty("--muted", area.surface_color);
        root.style.setProperty("--accent", area.surface_color);
      }

      // Update favicon if provided
      if (area.favicon_url) {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (link) {
          link.href = area.favicon_url;
        } else {
          const newLink = document.createElement("link");
          newLink.rel = "icon";
          newLink.href = area.favicon_url;
          document.head.appendChild(newLink);
        }
      }

      // Update page title
      if (area.nome) {
        document.title = `${area.nome} — Paz em Canção`;
      }
    }
  }, [area]);

  return <>{children}</>;
}
