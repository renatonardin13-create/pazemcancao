import { createContext, useContext } from "react";

export type CardScope = "home" | "musicas" | "cursos";

export const getCardsConfigSync = () => ({
  showProgress: true,
  cardGradient: 80,
  hoverGold: true,
  showBorder: true,
});

export const useCardScope = () => "home" as CardScope;

export const getCardSizingFor = (scope: CardScope) => ({
  card_width: 280,
  card_height: 380,
  card_border_radius: 24,
  card_spacing: 24,
});

export const gridSizingStyle = (scope: CardScope) => ({});
export const cardSizingStyle = (scope: CardScope) => ({});

const CardScopeContext = createContext<CardScope>("home");
export const CardScopeProvider = ({ scope, children }: { scope: CardScope, children: React.ReactNode }) => (
  <CardScopeContext.Provider value={scope}>{children}</CardScopeContext.Provider>
);
