/**
 * Padrão de cards da plataforma — agora controlado pelo Admin
 * (Configurações → Cards), por escopo: home / musicas / cursos.
 *
 * As classes abaixo são fallbacks visuais (mantêm compatibilidade
 * com chamadas existentes). O sizing real e responsivo vem do
 * `CardScopeProvider` + `gridSizingStyle()`/`cardSizingStyle()`,
 * aplicados pelos componentes <PosterGrid> e <PosterShelfItem>
 * abaixo, e pelo próprio PosterCard.
 */

import type { ReactNode, CSSProperties } from "react";
import {
  gridSizingStyle,
  cardSizingStyle,
  useCardScope,
  getCardSizingFor,
} from "@/hooks/use-cards-config";

/** Classes legadas (fallback). Prefira <PosterGrid> abaixo. */
export const POSTER_GRID =
  "grid gap-4 sm:gap-5 lg:gap-6 items-start justify-items-stretch w-full " +
  "[grid-template-columns:repeat(auto-fill,minmax(160px,1fr))] " +
  "sm:[grid-template-columns:repeat(auto-fill,minmax(190px,1fr))] " +
  "md:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] " +
  "lg:[grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] " +
  "xl:[grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] " +
  "2xl:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]";

export const POSTER_SHELF_ITEM =
  "w-[160px] sm:w-[190px] md:w-[220px] lg:w-[250px] xl:w-[280px] 2xl:w-[300px] " +
  "shrink-0 grow-0 basis-auto snap-start";

/** Grid responsivo que usa o sizing configurado no Admin para o escopo atual. */
export function PosterGrid({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const scope = useCardScope();
  const base = gridSizingStyle(scope);
  return (
    <div className={className} style={{ ...base, ...style }}>
      {children}
    </div>
  );
}

/** Item de prateleira horizontal: largura fixa = card_width do escopo. */
export function PosterShelfItem({ children }: { children: ReactNode }) {
  const scope = useCardScope();
  const s = getCardSizingFor(scope);
  return (
    <div
      className="shrink-0 grow-0 basis-auto snap-start"
      style={{ width: `min(${s.card_width}px, 80vw)` }}
    >
      <div style={cardSizingStyle(scope)}>{children}</div>
    </div>
  );
}
