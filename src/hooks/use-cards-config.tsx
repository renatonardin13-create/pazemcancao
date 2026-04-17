import { useQuery } from "@tanstack/react-query";
import { getPlatformSettings } from "@/lib/platform-settings.functions";

export interface CardsConfig {
  showTitle: boolean;
  showDesc: boolean;
  showCategory: boolean;
  showLock: boolean;
  showProgress: boolean;
  showBorder: boolean;
  hoverGold: boolean;
  cardGradient: number;   // 0-100
  bannerGradient: number; // 0-100
  cardsPerShelf: number;  // limite por prateleira
}

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
};

let cachedConfig: CardsConfig = DEFAULT_CARDS_CONFIG;

export function getCardsConfigSync(): CardsConfig {
  return cachedConfig;
}

export function useCardsConfig(): CardsConfig {
  const { data } = useQuery({
    queryKey: ["platform-settings", "cards_config"],
    queryFn: async () => {
      const res = await getPlatformSettings();
      return (res?.settings?.cards_config ?? {}) as Partial<CardsConfig>;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const merged = { ...DEFAULT_CARDS_CONFIG, ...(data ?? {}) };
  cachedConfig = merged;
  return merged;
}
