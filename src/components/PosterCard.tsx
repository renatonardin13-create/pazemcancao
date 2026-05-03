import { memo, useState, type ReactNode } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Play } from "lucide-react";
import { getCardsConfigSync, useCardScope, getCardSizingFor } from "@/hooks/use-cards-config";

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

const DEFAULT_GRADIENT = "from-[#111] via-[#111] to-[#0b0b0b]";

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
  const scope = useCardScope();
  const sizing = getCardSizingFor(scope);
  const hasProgress = cfg.showProgress && typeof progress === "number" && progress > 0;
  const gradientOpacity = Math.max(0, Math.min(100, cfg.cardGradient)) / 100;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = typeof cover === "string" && cover && !imgFailed;

  // aspect-ratio derivado do tamanho desktop configurado (mantém proporção em mobile)
  const aspectRatio = `${sizing.card_width} / ${sizing.card_height}`;
  const radius = `${sizing.card_border_radius}px`;

  return (
    <div
      className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto w-full"
      style={{
        animationDelay: `${Math.min(index * 80, 400)}ms`,
        animationFillMode: "both",
        maxWidth: `${sizing.card_width}px`,
      }}
    >
      {aboveCard}

      {/* Glow dourado ambiente — sutil, premium */}
      <div
        className={`absolute -inset-3 rounded-3xl blur-2xl pointer-events-none md:transition-all md:duration-500 ${
          highlight
            ? "bg-gold/[0.10] opacity-100"
            : cfg.hoverGold
              ? "bg-gold/[0.18] opacity-0 md:group-hover/card:opacity-100"
              : "bg-transparent opacity-0"
        }`}
      />

      <div
        className={`relative overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 transition-all duration-300 ease-out group-hover/card:scale-[1.05] group-hover/card:shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${
          cfg.hoverGold ? "hover:ring-gold/40" : ""
        } ${
          highlight ? "ring-gold/30 shadow-[0_2px_32px_-8px] shadow-gold/15" : cfg.showBorder ? "ring-white/[0.04]" : "ring-transparent"
        }`}
        style={{ borderRadius: radius }}
      >
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} aspect-video`}
          style={{ borderRadius: radius }}
        >
          {/* Capa */}
          {showImage ? (
            <OptimizedImage
              src={cover as string}
              alt={coverAlt}
              context="card"
              onError={() => setImgFailed(true)}
              className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110 ${
                locked ? "saturate-[0.45] brightness-[0.6]" : ""
              }`}
            />
          ) : cover && typeof cover !== "string" ? (
            cover
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111]">{fallback}</div>
          )}

          {/* Gradiente inferior (legibilidade do título) */}
          <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/95 via-black/55 to-transparent" style={{ opacity: 0.5 + gradientOpacity * 0.5 }} />

          {/* Escurecimento de hover + Assistir Button */}
          <div
            className={`absolute inset-0 transition-all duration-500 flex items-center justify-center ${
              locked ? "bg-black/20" : "bg-black/0 group-hover/card:bg-black/60"
            }`}
          >
            {!locked && (
              <div className="opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-y-4 group-hover/card:translate-y-0">
                <div className="bg-gold text-black rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest shadow-2xl shadow-gold/40 flex items-center gap-2">
                  <Play className="h-3 w-3 fill-current" />
                  Assistir
                </div>
              </div>
            )}
          </div>

          {/* Vinheta interna */}
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

          {badgeTopLeft && <div className="absolute top-2.5 left-2.5 z-10">{badgeTopLeft}</div>}
          {badgeTopRight && <div className="absolute top-2.5 right-2.5 z-10">{badgeTopRight}</div>}

          {overlay && <div className="absolute inset-0 z-10">{overlay}</div>}

          {/* Info Block - Netflix Style (Bottom layer for legibility) */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 pt-10 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/80 to-transparent">
            <h3 className="text-sm font-black text-white leading-tight truncate">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {subtitle && <span className="text-[10px] font-black text-gold uppercase tracking-widest">{subtitle}</span>}
              {meta && <div className="text-[10px] font-bold text-white/40">{meta}</div>}
            </div>
          </div>

          {overlay && <div className="absolute inset-0 z-20">{overlay}</div>}

          {centerAction && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              {centerAction}
            </div>
          )}

          {actionTopRight && <div className="absolute top-2.5 right-2.5 z-40">{actionTopRight}</div>}

          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 z-50 h-[3px] bg-white/10">
              <div
                className={`h-full rounded-r-full ease-linear transition-all duration-300 ${progressColorClass}`}
                style={{ width: `${Math.min(progress!, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
