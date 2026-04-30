import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { getPlatformSettings } from "@/lib/platform-settings.functions";

export type CardScopeKey = "home" | "musicas" | "cursos";

export interface CardSizing {
  /** largura desktop em px */
  card_width: number;
  /** altura desktop em px */
  card_height: number;
  /** largura mínima em px (mobile) */
  card_min_width: number;
  /** altura mínima em px (mobile) */
  card_min_height: number;
  /** raio da borda em px */
  card_border_radius: number;
  /** gap entre cards em px */
  card_gap: number;
}

export interface CardsConfig {
  showTitle: boolean;
  showDesc: boolean;
  showCategory: boolean;
  showLock: boolean;
  showProgress: boolean;
  showBorder: boolean;
  hoverGold: boolean;
  cardGradient: number;
  bannerGradient: number;
  cardsPerShelf: number;
  /** Sizing por escopo de página */
  sizing: Record<CardScopeKey, CardSizing>;
}

export const DEFAULT_CARD_SIZING: CardSizing = {
  card_width: 300,
  card_height: 460,
  card_min_width: 160,
  card_min_height: 245,
  card_border_radius: 16,
  card_gap: 20,
};

export const DEFAULT_CARDS_CONFIG: CardsConfig = {
  showTitle: true,
  showDesc: false,
  showCategory: true,
  showLock: true,
  showProgress: true,
  showBorder: true,
  hoverGold: true,
  cardGradient: 20,
  bannerGradient: 20,
  cardsPerShelf: 20,
  sizing: {
    home: { ...DEFAULT_CARD_SIZING },
    musicas: { ...DEFAULT_CARD_SIZING },
    cursos: { ...DEFAULT_CARD_SIZING },
  },
};

let cachedConfig: CardsConfig = DEFAULT_CARDS_CONFIG;

export function getCardsConfigSync(): CardsConfig {
  return cachedConfig;
}

function mergeSizing(raw: any): CardsConfig["sizing"] {
  const src = (raw && typeof raw === "object") ? raw : {};
  return {
    home: { ...DEFAULT_CARD_SIZING, ...(src.home ?? {}) },
    musicas: { ...DEFAULT_CARD_SIZING, ...(src.musicas ?? {}) },
    cursos: { ...DEFAULT_CARD_SIZING, ...(src.cursos ?? {}) },
  };
}

import { useArea } from "@/providers/AreaProvider";

export function useCardsConfig(): CardsConfig {
  const { currentArea } = useArea();
  
  const { data } = useQuery({
    queryKey: ["platform-settings", "cards_config", currentArea?.id],
    queryFn: async () => {
      // Prioritize area settings if available
      const areaSettings = currentArea?.settings as Record<string, any> | undefined;
      if (areaSettings?.cards_config) {
        return areaSettings.cards_config as Partial<CardsConfig>;
      }
      
      const res = await getPlatformSettings();
      return (res?.settings?.cards_config ?? {}) as Partial<CardsConfig>;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const raw = data ?? {};
  const merged: CardsConfig = {
    ...DEFAULT_CARDS_CONFIG,
    ...raw,
    sizing: mergeSizing((raw as any).sizing),
  };

  cachedConfig = merged;
  return merged;
}

/* ─── Card Scope (por página) ──────────────────────────────────────── */

const CardScopeContext = createContext<CardScopeKey | null>(null);

export function CardScopeProvider({
  scope,
  children,
}: {
  scope: CardScopeKey;
  children: ReactNode;
}) {
  return <CardScopeContext.Provider value={scope}>{children}</CardScopeContext.Provider>;
}

export function useCardScope(): CardScopeKey | null {
  return useContext(CardScopeContext);
}

/** Retorna o sizing efetivo para o escopo atual (ou home como fallback). */
export function getCardSizingFor(scope: CardScopeKey | null): CardSizing {
  const cfg = getCardsConfigSync();
  if (scope && cfg.sizing[scope]) return cfg.sizing[scope];
  return cfg.sizing.home;
}

/** Estilos inline (CSS vars) para o container do card. */
export function cardSizingStyle(scope: CardScopeKey | null): React.CSSProperties {
  const s = getCardSizingFor(scope);
  return {
    width: "100%",
    maxWidth: `${s.card_width}px`,
    minWidth: 0,
  };
}

/** Estilos para a grid responsiva baseada no sizing. */
export function gridSizingStyle(scope: CardScopeKey | null): React.CSSProperties {
  const s = getCardSizingFor(scope);
  return {
    display: "grid",
    gap: `${s.card_gap}px`,
    gridTemplateColumns: `repeat(auto-fill, minmax(min(${s.card_min_width}px, 100%), 1fr))`,
    alignItems: "start",
    width: "100%",
  };
}
