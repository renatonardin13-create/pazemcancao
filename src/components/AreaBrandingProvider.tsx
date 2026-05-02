import { useEffect } from "react";
import { useArea } from "@/hooks/use-area";

export function AreaBrandingProvider({ children }: { children: React.ReactNode }) {
  const { area } = useArea();

  useEffect(() => {
    if (area) {
      const root = document.documentElement;
      
      // Update primary color
      if (area.primary_color) {
        root.style.setProperty("--gold", area.primary_color);
        root.style.setProperty("--primary", area.primary_color);
        root.style.setProperty("--ring", area.primary_color);
      }

      // Update secondary color if specified
      if (area.secondary_color) {
        // You could use this for background or other accent colors
        // root.style.setProperty("--secondary", area.secondary_color);
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
