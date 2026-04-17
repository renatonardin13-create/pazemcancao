import { memo, useState, type ReactNode } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getCardsConfigSync } from "@/hooks/use-cards-config";

/**
 * PosterCard — Card Master.
 *
 * Componente-base UNIFICADO de toda a plataforma para cards 9:13.
 * Define largura, altura, proporção, posição de título/metadados/ações,
 * gradiente inferior, anel, vinheta e glow ambiente.
 *
 * Use este componente em:
 * - TrackCard (músicas / louvores)
 * - ContentCard (bônus, ebooks, conteúdos)
 * - CourseShelfCard (cursos)
 * - Cards horizontais de prateleiras
 *
 * Slots:
 * - cover: imagem de fundo (string url) OU ReactNode customizado
 * - fallback: fallback quando não há cover
 * - badgeTopLeft / badgeTopRight: badges no topo
 * - overlay: overlay central (lock, em breve, etc)
 * - centerAction: ação central revelada no hover (botão play/download)
 * - actionTopRight: ação flutuante no topo (favorito, etc)
 * - title: título principal (linha 1-2)
 * - subtitle: descrição/meta secundária (linha 1-2)
 * - meta: linha de ações/metadados revelada no hover
 * - progress: barra de progresso 0-100 na borda inferior
 * - aboveCard: elemento fora do card (ex: "Continue aqui")
 *
 * Props utilitárias:
 * - locked: aplica saturação/escurecimento na imagem
 * - highlight: realce permanente (anel/glow do "último acessado")
 * - index: usado para stagger de animação
 */

export interface PosterCardProps {
  /** URL da imagem OU node customizado (svg/icon) */
  cover?: string | ReactNode | null;
  /** alt para a imagem (obrigatório quando cover é string) */
  coverAlt?: string;
  /** Fallback exibido quando não há cover */
  fallback?: ReactNode;
  /** Gradiente de fundo do "container da capa" (classes tailwind) */
  gradientClass?: string;

  badgeTopLeft?: ReactNode;
  badgeTopRight?: ReactNode;
  overlay?: ReactNode;
  centerAction?: ReactNode;
  actionTopRight?: ReactNode;

  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;

  /** 0-100. Quando informado renderiza a barra inferior. */
  progress?: number | null;
  progressColorClass?: string;

  locked?: boolean;
  highlight?: boolean;
  index?: number;

  aboveCard?: ReactNode;
}

const DEFAULT_GRADIENT = "from-sky-900/40 via-blue-950/30 to-slate-950/50";

export const PosterCard = memo(function PosterCard({
  cover,
  coverAlt = "",
  fallback,
  gradientClass = DEFAULT_GRADIENT,
  badgeTopLeft,
  badgeTopRight,
  overlay,
  centerAction,
  actionTopRight,
  title,
  subtitle,
  meta,
  progress = null,
  progressColorClass = "bg-gold",
  locked = false,
  highlight = false,
  index = 0,
  aboveCard,
}: PosterCardProps) {
  const cfg = getCardsConfigSync();
  const hasProgress = cfg.showProgress && typeof progress === "number" && progress > 0;
  const gradientOpacity = Math.max(0, Math.min(100, cfg.cardGradient)) / 100;

  return (
    <div
      className="relative animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${Math.min(index * 80, 400)}ms`, animationFillMode: "both" }}
    >
      {aboveCard}

      {/* Glow ambiente — respeita hoverGold */}
      <div
        className={`absolute -inset-4 rounded-3xl blur-3xl pointer-events-none md:transition-all md:duration-700 ${
          highlight ? "bg-gold/[0.05]" : cfg.hoverGold ? "bg-gold/0 md:group-hover/card:bg-gold/[0.05]" : "bg-transparent"
        }`}
      />

      <div
        className={`relative overflow-hidden rounded-[14px] sm:rounded-[16px] bg-card/5 shadow-md shadow-black/25 md:transition-all md:duration-500 md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:scale-[1.04] ${
          cfg.showBorder ? "ring-1" : ""
        } ${
          cfg.hoverGold ? "md:group-hover/card:ring-gold/15" : ""
        } ${
          highlight ? "ring-gold/12 shadow-[0_2px_32px_-8px] shadow-gold/8" : cfg.showBorder ? "ring-white/[0.04]" : ""
        }`}
      >
        <div className={`relative aspect-[9/13] overflow-hidden bg-gradient-to-br ${gradientClass}`}>
          {/* Capa */}
          {typeof cover === "string" && cover ? (
            <OptimizedImage
              src={cover}
              alt={coverAlt}
              context="card"
              className={`h-full w-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08] ${
                locked ? "saturate-[0.45] brightness-[0.6]" : ""
              }`}
            />
          ) : cover ? (
            cover
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">{fallback}</div>
          )}

          {/* Gradiente inferior (legibilidade do título) */}
          <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/95 via-black/55 to-transparent" style={{ opacity: 0.5 + gradientOpacity * 0.5 }} />

          {/* Escurecimento de hover */}
          <div
            className={`absolute inset-0 md:transition-all md:duration-500 ${
              locked ? "bg-black/20" : "bg-black/0 md:group-hover/card:bg-black/30"
            }`}
          />

          {/* Vinheta interna */}
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

          {badgeTopLeft && <div className="absolute top-2.5 left-2.5 z-10">{badgeTopLeft}</div>}
          {badgeTopRight && <div className="absolute top-2.5 right-2.5 z-10">{badgeTopRight}</div>}

          {overlay && <div className="absolute inset-0 z-10">{overlay}</div>}

          {centerAction && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              {centerAction}
            </div>
          )}

          {actionTopRight && <div className="absolute top-2.5 right-2.5 z-20">{actionTopRight}</div>}

          {/*
            Bloco inferior padronizado.
            Regras anti-irregularidade:
            - posicionamento absoluto (não empurra a capa)
            - title: SEMPRE 2 linhas reservadas (min-h)
            - subtitle: SEMPRE 1 linha (line-clamp-1)
            - meta: altura reservada mesmo quando some no hover
          */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-3.5 pb-4 sm:px-4 sm:pb-5">
            {cfg.showTitle && (
              <h3
                className={`line-clamp-2 min-h-[2.6em] text-sm font-bold leading-snug tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-[15px] ${
                  locked ? "text-white/60" : "text-white"
                }`}
              >
                {title}
              </h3>
            )}

            {(cfg.showCategory || cfg.showDesc) && (
              <p
                className={`mt-1.5 line-clamp-1 text-[10px] leading-relaxed sm:text-[11px] ${
                  locked ? "text-white/25" : "text-white/35"
                }`}
              >
                {subtitle ?? "\u00A0"}
              </p>
            )}

            <div className="mt-2 flex h-4 items-center gap-3 opacity-80 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-400">
              {meta}
            </div>
          </div>

          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 z-20 h-[2.5px] bg-white/[0.06]">
              <div
                className={`h-full rounded-r-full ease-linear md:transition-all md:duration-200 ${progressColorClass}`}
                style={{ width: `${Math.min(progress!, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
