import { memo } from "react";
import { Lock, Download, Play, ShoppingCart, Clock, ArrowRight, CheckCircle2, Eye, Heart, Star, Sparkles } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

interface ContentCardProps {
  item: any;
  index: number;
  hasAccess: boolean;
  gradient: string;
  TypeIcon: LucideIcon;
  progress?: { viewed_at?: string | null; completed_at?: string | null; last_position_seconds?: number; downloaded_at?: string | null } | null;
  isLastAccessed?: boolean;
  onTrackView?: (contentId: string) => void;
  onTrackDownload?: (contentId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (contentId: string, currentlyFavorite: boolean) => void;
}

type ContentState = 'completed' | 'in_progress' | 'not_started' | 'locked' | 'pending';

function getContentState(item: any, hasAccess: boolean, progress: ContentCardProps['progress']): ContentState {
  const isUnlocked = item.unlocked !== undefined ? item.unlocked : (item.is_free || hasAccess);
  if (!isUnlocked) {
    const accessMode = item.effectiveAccessMode || (item.is_free ? 'gratuito' : 'pago');
    if (accessMode === 'liberar_em_dias' && hasAccess) return 'pending';
    return 'locked';
  }
  if (progress?.completed_at) return 'completed';
  if (progress?.viewed_at) return 'in_progress';
  return 'not_started';
}

export const ContentCard = memo(function ContentCard({ item, index, hasAccess, gradient, TypeIcon, progress, isLastAccessed, onTrackView, onTrackDownload, isFavorite, onToggleFavorite }: ContentCardProps) {
  const accessMode = item.effectiveAccessMode || (item.is_free ? 'gratuito' : 'pago');
  const launchMode = item.launch_mode || 'none';
  const isLaunchContent = launchMode !== 'none';
  const isUnlocked = isLaunchContent ? false : (item.unlocked !== undefined ? item.unlocked : (item.is_free || hasAccess));
  const isLocked = !isUnlocked;
  const isPendingRelease = !isLaunchContent && accessMode === 'liberar_em_dias' && !isUnlocked && hasAccess;
  const isRuleLocked = !isLaunchContent && !!item.unlockRuleMessage && !isUnlocked;
  const daysLeft = item.unlockDate
    ? Math.max(0, Math.ceil((new Date(item.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : item.release_days || null;

  // Dynamic conversion badges
  const isNew = (Date.now() - new Date(item.created_at).getTime()) < 14 * 24 * 60 * 60 * 1000;
  const popularity = item._popularity || 0; // injected from parent if available
  const isBestSeller = popularity >= 10;

  const contentState = getContentState(item, hasAccess, progress);

  const progressPercent = contentState === 'completed' ? 100
    : contentState === 'in_progress' && progress?.last_position_seconds
      ? Math.min(90, Math.max(10, Math.round((progress.last_position_seconds / Math.max(progress.last_position_seconds + 120, 300)) * 100)))
    : contentState === 'in_progress' ? 15
    : 0;

  const handleLockedClick = () => {
    if (isLaunchContent) {
      if (launchMode === 'bloqueado_para_venda' && item.sales_page_url) {
        window.open(item.sales_page_url, "_blank");
      }
      // em_breve and lancamento_especial: no action (just show message)
      return;
    }
    if (isLocked && item.sales_page_url) {
      window.open(item.sales_page_url, "_blank");
    }
  };

  return (
    <div
      onClick={isLocked ? handleLockedClick : undefined}
      className={`group/card relative block animate-in fade-in slide-in-from-bottom-3 duration-500 ${isLocked ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms`, animationFillMode: 'both' }}
    >
      {/* Last accessed indicator */}
      {isLastAccessed && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold/60 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-gold/10">
            <Eye className="inline h-2.5 w-2.5 mr-1 -mt-0.5" />
            Continue aqui
          </span>
        </div>
      )}

      {/* Ambient glow */}
      <div className={`absolute -inset-4 rounded-3xl blur-3xl pointer-events-none md:transition-all md:duration-700 ${
        isLastAccessed ? "bg-gold/[0.05]" : "bg-gold/0 md:group-hover/card:bg-gold/[0.05]"
      }`} />

      <div className={`relative rounded-[14px] sm:rounded-[16px] overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 ring-white/[0.04] md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:ring-gold/15 md:transition-all md:duration-500 md:group-hover/card:scale-[1.04] ${
        isLastAccessed ? "ring-gold/12 shadow-[0_2px_32px_-8px] shadow-gold/8" : ""
      }`}>

        {/* Image — vertical poster 9:13 */}
        <div className={`relative aspect-[9/13] overflow-hidden bg-gradient-to-br ${gradient}`}>
          {(item.card_cover_url || item.cover_url) && (
            <OptimizedImage
              src={item.card_cover_url || item.cover_url}
              alt={item.title}
              context="card"
              className={`w-full h-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08] ${isLocked ? 'saturate-[0.45] brightness-[0.85]' : ''}`}
            />
          )}

          {!item.cover_url && !item.card_cover_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur-sm bg-white/[0.03] border border-white/[0.05] md:group-hover/card:bg-white/[0.05] md:transition-all md:duration-700">
                <TypeIcon className="h-6 w-6 text-white/20 md:group-hover/card:text-white/35 md:transition-colors md:duration-700" />
              </div>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

          {/* Hover darken */}
          <div className={`absolute inset-0 md:transition-all md:duration-500 ${isLocked ? 'bg-black/20' : 'bg-black/0 md:group-hover/card:bg-black/30'}`} />

          {/* Inner vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

          {/* Content type badge — top right */}
          <span className="absolute top-2.5 right-2.5 z-10 text-[9px] sm:text-[10px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/25 backdrop-blur-md border border-white/[0.05] px-2.5 py-1 text-white/35">
            {item.content_type === "ebook" ? "E-book" :
             item.content_type === "video" ? "Vídeo" :
             item.content_type === "free_lesson" ? "Aula" :
             "Material"}
          </span>

          {/* Badge text / dynamic badges — top left */}
          {item.badge_text ? (
            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/15 backdrop-blur-md border border-gold/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-gold/70">
              {item.badge_text}
            </span>
          ) : isBestSeller ? (
            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 backdrop-blur-md border border-amber-400/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400/70">
              🔥 Mais vendido
            </span>
          ) : isNew && !item.is_free ? (
            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 backdrop-blur-md border border-emerald-400/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400/70">
              ✨ Novo
            </span>
          ) : item.is_free ? (
            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-player-completed/15 backdrop-blur-md border border-player-completed/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-player-completed/70">
              Gratuito
            </span>
          ) : null}

          {/* Completed state badge */}
          {contentState === 'completed' && (
            <div className="absolute bottom-12 left-3 z-20 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-player-completed/80 bg-background/60 backdrop-blur-md border border-player-completed/15 rounded-full px-2.5 py-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Vivenciado ✨
            </div>
          )}

          {/* Premium lock overlay */}
          {isLocked && !isPendingRelease && !isRuleLocked && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-10">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-gold/10 blur-xl animate-pulse" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-amber-600/10 border border-gold/25 shadow-lg shadow-gold/10">
                  <Lock className="h-6 w-6 text-gold/65" />
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/60 text-center px-4">
                {item.locked_label || 'Acesso Exclusivo'}
              </span>
              {item.sales_page_url && (
                <span className="text-[9px] font-medium text-gold/40 flex items-center gap-1.5 bg-gold/[0.06] border border-gold/12 rounded-full px-3 py-1">
                  <ShoppingCart className="h-2.5 w-2.5" />
                  Toque para garantir
                </span>
              )}
            </div>
          )}

          {/* Pending release overlay */}
          {isPendingRelease && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2.5 z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Clock className="h-5 w-5 text-primary/55" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/45">
                {daysLeft !== null && daysLeft > 0
                  ? `Libera em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`
                  : 'Liberação em breve'}
              </span>
              {item.unlockDate && (
                <span className="text-[10px] text-muted-foreground/35">
                  {new Date(item.unlockDate).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          )}

          {/* Unlock rule overlay */}
          {isRuleLocked && !isPendingRelease && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2.5 z-10 px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 border border-gold/18">
                <Lock className="h-5 w-5 text-gold/50" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold/45 text-center max-w-[85%] leading-relaxed">
                {item.unlockRuleMessage}
              </span>
              {item.unlockRuleContentTitle && (
                <Link
                  to="/conteudo"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-[10px] font-medium text-gold/50 hover:text-gold/70 bg-black/20 rounded-full px-3 py-1 border border-gold/10 hover:border-gold/20 transition-all duration-500"
                >
                  <ArrowRight className="h-2.5 w-2.5" />
                  {item.unlockRuleContentTitle}
                </Link>
              )}
            </div>
          )}

          {/* Favorite button */}
          {onToggleFavorite && !isLocked && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleFavorite(item.id, !!isFavorite);
              }}
              className={`absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
                isFavorite
                  ? "bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30"
                  : "bg-black/25 border border-white/10 text-white/35 hover:text-white/60 hover:bg-black/40"
              }`}
              title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}

          {/* Play CTA for unlocked items — center on hover */}
          {!isLocked && (item.video_url || item.file_url) && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="flex items-center gap-2 h-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gold/95 shadow-[0_4px_24px_rgba(0,0,0,0.4)] scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]">
                {item.video_url ? (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gold-foreground fill-gold-foreground" />
                ) : (
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-gold-foreground" />
                )}
              </div>
            </div>
          )}

          {/* Title + meta — bottom */}
          <div className="absolute inset-x-0 bottom-0 px-3.5 sm:px-4 pb-4 sm:pb-5 z-10">
            <h3 className={`text-sm sm:text-[15px] font-bold line-clamp-2 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight ${
              isLocked ? "text-white/60" : "text-white"
            }`}>
              {item.title}
            </h3>

            {item.description && (
              <p className={`text-[10px] sm:text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                isLocked ? "text-white/25" : "text-white/35"
              }`}>
                {item.description}
              </p>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-3 mt-2 opacity-80 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-400">
              {isUnlocked ? (
                <>
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { e.stopPropagation(); onTrackDownload?.(item.id); }}
                      className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55 hover:text-gold/80 transition-colors duration-500"
                    >
                      <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      Baixar
                    </a>
                  )}
                  {item.video_url && (
                    <span
                      onClick={(e) => { e.stopPropagation(); onTrackView?.(item.id); }}
                      className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55 cursor-pointer hover:text-gold/80 transition-colors duration-500"
                    >
                      <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      Assistir
                    </span>
                  )}
                </>
              ) : isPendingRelease ? (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-primary/40">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Em breve
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/35">
                  <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {item.sales_page_url ? "Quero esse conteúdo" : "Especial"}
                </span>
              )}

              {contentState === 'completed' && (
                <span className="text-[9px] sm:text-[10px] font-medium tracking-wider text-player-completed/70">
                  <CheckCircle2 className="inline h-2.5 w-2.5 mr-0.5 -mt-0.5" />
                  Vivenciado
                </span>
              )}
            </div>
          </div>

          {/* Progress bar — bottom edge */}
          {contentState === 'in_progress' && progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/[0.06] z-20">
              <div
                className="h-full rounded-r-full bg-gold md:transition-all md:duration-700"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
