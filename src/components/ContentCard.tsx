import { motion } from "framer-motion";
import { Lock, Download, Play, ShoppingCart, Clock, ArrowRight, CheckCircle2, Eye, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtube.com")) videoId = u.searchParams.get("v");
    else if (u.hostname.includes("youtu.be")) videoId = u.pathname.slice(1);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
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

const stateConfig: Record<ContentState, { label: string; color: string }> = {
  completed: { label: 'Concluído', color: 'text-player-completed/70' },
  in_progress: { label: 'Em andamento', color: 'text-primary/60' },
  not_started: { label: '', color: '' },
  locked: { label: 'Exclusivo', color: 'text-gold/50' },
  pending: { label: 'Em breve', color: 'text-primary/50' },
};

export function ContentCard({ item, index, hasAccess, gradient, TypeIcon, progress, isLastAccessed, onTrackView, onTrackDownload, isFavorite, onToggleFavorite }: ContentCardProps) {
  const embedUrl = item.video_url ? getYouTubeEmbedUrl(item.video_url) : null;
  
  const accessMode = item.effectiveAccessMode || (item.is_free ? 'gratuito' : 'pago');
  const isUnlocked = item.unlocked !== undefined ? item.unlocked : (item.is_free || hasAccess);
  const isLocked = !isUnlocked;
  const isPendingRelease = accessMode === 'liberar_em_dias' && !isUnlocked && hasAccess;
  const isRuleLocked = !!item.unlockRuleMessage && !isUnlocked;
  const daysLeft = item.unlockDate
    ? Math.max(0, Math.ceil((new Date(item.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : item.release_days || null;

  const contentState = getContentState(item, hasAccess, progress);
  const stateInfo = stateConfig[contentState];

  const progressPercent = contentState === 'completed' ? 100 
    : contentState === 'in_progress' && progress?.last_position_seconds ? Math.min(95, Math.max(5, (progress.last_position_seconds / 600) * 100))
    : 0;

  const handleLockedClick = () => {
    if (isLocked && item.sales_page_url) {
      window.open(item.sales_page_url, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={isLocked ? handleLockedClick : undefined}
      className={`group relative rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-700 ${
        isLastAccessed
          ? "ring-1 ring-gold/12 shadow-[0_2px_32px_-8px] shadow-gold/8 bg-card/30"
          : isLocked
            ? "bg-card/12 cursor-pointer"
            : "bg-card/18 hover:bg-card/28 hover:shadow-[0_8px_48px_-16px] hover:shadow-gold/6"
      } border border-border/12 hover:border-border/20`}
    >
      {/* Last accessed indicator */}
      {isLastAccessed && (
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold/60 bg-background/80 backdrop-blur-md px-3 py-1 rounded-b-lg border-x border-b border-gold/10">
            <Eye className="inline h-2.5 w-2.5 mr-1 -mt-0.5" />
            Último acessado
          </span>
        </div>
      )}

      {/* Cover image area */}
      <div className={`relative h-44 sm:h-48 w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
        {embedUrl && !isLocked ? (
          <iframe
            src={embedUrl}
            title={item.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => onTrackView?.(item.id)}
          />
        ) : (
          <>
            {(item.card_cover_url || item.cover_url) && (
              <img
                src={item.card_cover_url || item.cover_url}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            )}
            {/* Softer vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,transparent_40%,rgba(0,0,0,0.35))]" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

            {!item.cover_url && !item.card_cover_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur-sm bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.05] transition-all duration-700">
                  <TypeIcon className="h-6 w-6 text-white/20 group-hover:text-white/35 transition-colors duration-700" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Content type badge */}
        <span className="absolute top-3.5 right-3.5 text-[10px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/25 backdrop-blur-md border border-white/[0.05] px-2.5 py-0.5 text-white/35">
          {item.content_type === "ebook" ? "E-book" :
           item.content_type === "video" ? "Vídeo" :
           item.content_type === "free_lesson" ? "Aula" :
           "Material"}
        </span>

        {/* Badge text (custom or free) */}
        {item.badge_text ? (
          <span className="absolute top-3.5 left-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/70 bg-gold/10 backdrop-blur-md border border-gold/15 rounded-full px-2.5 py-0.5">
            {item.badge_text}
          </span>
        ) : item.is_free ? (
          <span className="absolute top-3.5 left-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-player-completed/70 bg-player-completed/10 backdrop-blur-md border border-player-completed/15 rounded-full px-2.5 py-0.5">
            Gratuito
          </span>
        ) : null}

        {/* State badge (completed) */}
        {contentState === 'completed' && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-player-completed/80 bg-background/60 backdrop-blur-md border border-player-completed/15 rounded-full px-2.5 py-1">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Concluído
          </div>
        )}

        {/* Lock overlay for paid content */}
        {isLocked && !isPendingRelease && !isRuleLocked && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2.5 transition-all duration-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 border border-gold/20 shadow-lg shadow-gold/5">
              <Lock className="h-5 w-5 text-gold/60" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold/55">
              Conteúdo Exclusivo
            </span>
          </div>
        )}

        {/* Pending release overlay */}
        {isPendingRelease && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2.5 transition-all duration-700">
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
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2.5 transition-all duration-700 px-4">
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
      </div>

      {/* Content info — more breathing room */}
      <div className="relative p-5 sm:p-6 flex flex-col flex-1">
        <h3 className={`font-display text-[15px] font-bold tracking-tight leading-snug transition-colors duration-700 ${
          isLocked ? "text-foreground/40" : "text-foreground/80 group-hover:text-foreground/95"
        }`}>
          {item.title}
        </h3>

        {item.description && (
          <p className={`mt-2.5 text-[12px] leading-[1.9] line-clamp-2 transition-colors duration-700 flex-1 ${
            isLocked ? "text-muted-foreground/35" : "text-muted-foreground/50 group-hover:text-muted-foreground/65"
          }`}>
            {item.description}
          </p>
        )}

        {/* Progress bar for in-progress items */}
        {contentState === 'in_progress' && progressPercent > 0 && (
          <div className="mt-3.5 space-y-1.5">
            <Progress value={progressPercent} className="h-1 bg-muted/15" />
            <p className="text-[10px] text-primary/50 font-medium tracking-wide">
              {Math.round(progressPercent)}% concluído
            </p>
          </div>
        )}

        {/* Actions — cleaner separator */}
        <div className="mt-5 pt-4 border-t border-border/6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <>
                {item.file_url && (
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackDownload?.(item.id);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-gold/45 hover:text-gold/70 transition-colors duration-500"
                  >
                    <Download className="h-3 w-3" />
                    Baixar
                  </a>
                )}
                {item.video_url && !embedUrl && (
                  <a
                    href={item.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackView?.(item.id);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-gold/45 hover:text-gold/70 transition-colors duration-500"
                  >
                    <Play className="h-3 w-3" />
                    Assistir
                  </a>
                )}
                {!item.file_url && !item.video_url && (
                  <span className="text-[11px] text-muted-foreground/35 tracking-wider uppercase">
                    Disponível
                  </span>
                )}
              </>
            ) : isPendingRelease ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-primary/40">
                <Clock className="h-3 w-3" />
                Em breve
              </span>
            ) : isRuleLocked ? (
              <Link
                to="/conteudo"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-gold/45 hover:text-gold/65 transition-colors duration-500"
              >
                <ArrowRight className="h-3 w-3" />
                {item.unlockRuleContentTitle ? `Ver "${item.unlockRuleContentTitle}"` : "Pré-requisito"}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-gold/35">
                <ShoppingCart className="h-3 w-3" />
                {item.sales_page_url ? "Adquirir" : "Exclusivo"}
              </span>
            )}
          </div>

          {/* State indicator */}
          {stateInfo.label && !isLocked && (
            <span className={`text-[10px] font-medium tracking-wider ${stateInfo.color}`}>
              {contentState === 'completed' && <CheckCircle2 className="inline h-2.5 w-2.5 mr-0.5 -mt-0.5" />}
              {stateInfo.label}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
