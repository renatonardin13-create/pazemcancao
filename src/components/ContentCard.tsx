import { motion } from "framer-motion";
import { Lock, Download, Play, ShoppingCart, Clock, Sparkles, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ContentCardProps {
  item: any;
  index: number;
  hasAccess: boolean;
  gradient: string;
  TypeIcon: LucideIcon;
  badgeOverride?: string;
}

type BadgeStyle = { text: string; textClass: string; bgClass: string; borderClass: string };

function computeAutoBadge(item: any, hasAccess: boolean): BadgeStyle | null {
  if (item.badge_text) return null;

  const accessMode = item.effectiveAccessMode || (item.is_free ? 'gratuito' : 'pago');
  const isUnlocked = item.unlocked !== undefined ? item.unlocked : (item.is_free || hasAccess);
  const daysLeft = item.unlockDate
    ? Math.max(0, Math.ceil((new Date(item.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // "LIBERA EM X DIAS"
  if (accessMode === 'liberar_em_dias' && !isUnlocked && hasAccess && daysLeft !== null && daysLeft > 0) {
    return { text: `⏳ ${daysLeft}d`, textClass: "text-blue-300/80", bgClass: "bg-blue-500/15", borderClass: "border-blue-500/20" };
  }

  // "CONTINUE"
  if (item._progressViewed && !item._progressCompleted && isUnlocked) {
    return { text: "▶ Continue", textClass: "text-amber-300/80", bgClass: "bg-amber-500/15", borderClass: "border-amber-500/20" };
  }

  // "GRÁTIS"
  if (item.is_free) {
    return { text: "Gratuito", textClass: "text-emerald-300/80", bgClass: "bg-emerald-500/15", borderClass: "border-emerald-500/20" };
  }

  // "NOVO"
  const createdAt = item.created_at ? new Date(item.created_at) : null;
  if (createdAt && (Date.now() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000) {
    return { text: "✨ Novo", textClass: "text-purple-300/80", bgClass: "bg-purple-500/15", borderClass: "border-purple-500/20" };
  }

  // "VIP" for locked paid content — premium feel
  if (accessMode === 'pago' && !isUnlocked && !item.is_free) {
    return { text: "✦ VIP", textClass: "text-gold/90", bgClass: "bg-gold/20", borderClass: "border-gold/30" };
  }

  // "VIP" for unlocked paid
  if (accessMode === 'pago' && !item.is_free) {
    return { text: "VIP", textClass: "text-gold/80", bgClass: "bg-gold/15", borderClass: "border-gold/20" };
  }

  return null;
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

export function ContentCard({ item, index, hasAccess, gradient, TypeIcon, badgeOverride }: ContentCardProps) {
  const embedUrl = item.video_url ? getYouTubeEmbedUrl(item.video_url) : null;
  
  const accessMode = item.effectiveAccessMode || (item.is_free ? 'gratuito' : 'pago');
  const isUnlocked = item.unlocked !== undefined ? item.unlocked : (item.is_free || hasAccess);
  const isLocked = !isUnlocked;
  const isPaidLocked = isLocked && accessMode === 'pago' && !item.is_free;
  const isPendingRelease = accessMode === 'liberar_em_dias' && !isUnlocked && hasAccess;
  const isRuleLocked = !!item.unlockRuleMessage && !isUnlocked;
  const daysLeft = item.unlockDate
    ? Math.max(0, Math.ceil((new Date(item.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : item.release_days || null;

  const handleLockedClick = () => {
    if (isLocked && item.sales_page_url) {
      window.open(item.sales_page_url, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ scale: isLocked ? 1.02 : 1.03, y: isLocked ? -3 : -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={isLocked ? handleLockedClick : undefined}
      className={`group relative rounded-3xl border overflow-hidden h-full flex flex-col transition-all duration-700 ${
        isPaidLocked
          ? "border-gold/10 bg-card/8 cursor-pointer hover:border-gold/20 hover:shadow-[0_8px_50px_-12px] hover:shadow-gold/10"
          : isLocked
            ? "border-border/8 bg-card/5 cursor-pointer"
            : "border-border/8 bg-card/10 hover:border-gold/15 hover:shadow-[0_8px_40px_-10px] hover:shadow-gold/8"
      } shadow-[0_4px_30px_-10px] shadow-black/20`}
    >
      {/* Cover image area */}
      <div className={`relative h-40 sm:h-44 w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Show embedded video only if unlocked */}
        {embedUrl && !isLocked ? (
          <iframe
            src={embedUrl}
            title={item.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {(item.card_cover_url || item.cover_url) && (
              <img
                src={item.card_cover_url || item.cover_url}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_30%,rgba(0,0,0,0.4))]" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.03] to-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Floating icon when no cover */}
            {!item.cover_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm bg-white/[0.04] border border-white/[0.06] group-hover:scale-105 group-hover:bg-white/[0.07] transition-all duration-700">
                  <TypeIcon className="h-7 w-7 text-white/25 group-hover:text-white/40 transition-colors duration-500" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Content type badge */}
        <span className="absolute top-4 right-4 text-[9px] font-medium tracking-[0.2em] uppercase rounded-full bg-black/20 backdrop-blur-sm border border-white/[0.06] px-3 py-1 text-white/30">
          {item.content_type === "ebook" ? "📚 E-book" :
           item.content_type === "video" ? "🎬 Vídeo" :
           item.content_type === "free_lesson" ? "🎓 Aula" :
           "📄 Material"}
        </span>

        {/* Badge text — manual or auto-generated */}
        {(() => {
          if (item.badge_text || badgeOverride) {
            const text = badgeOverride || item.badge_text;
            return (
              <span className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-widest text-gold/80 bg-gold/15 backdrop-blur-sm border border-gold/20 rounded-full px-3 py-1">
                {text}
              </span>
            );
          }
          const auto = computeAutoBadge(item, hasAccess);
          if (auto) {
            return (
              <span className={`absolute top-4 left-4 text-[9px] font-bold uppercase tracking-widest ${auto.textClass} ${auto.bgClass} backdrop-blur-sm border ${auto.borderClass} rounded-full px-3 py-1`}>
                {auto.text}
              </span>
            );
          }
          return null;
        })()}

        {/* Premium locked overlay for paid content — aspirational, not frustrating */}
        {isPaidLocked && !isPendingRelease && !isRuleLocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 transition-all duration-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 border border-gold/25 group-hover:bg-gold/20 group-hover:border-gold/35 group-hover:scale-110 transition-all duration-500">
              <Crown className="h-6 w-6 text-gold/70 group-hover:text-gold/90 transition-colors duration-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/60 bg-black/30 rounded-full px-4 py-1.5 border border-gold/15 group-hover:text-gold/80 group-hover:border-gold/25 transition-all duration-500">
              ✦ Conteúdo Exclusivo
            </span>
            {/* Subtle CTA on hover */}
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold/0 group-hover:text-gold/50 transition-all duration-700 mt-0.5">
              Toque para desbloquear
            </span>
          </div>
        )}

        {/* Generic lock overlay for non-paid locked */}
        {isLocked && !isPaidLocked && !isPendingRelease && !isRuleLocked && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 transition-all duration-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 border border-gold/25">
              <Lock className="h-6 w-6 text-gold/70" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/50 bg-black/30 rounded-full px-4 py-1.5 border border-gold/15">
              🔒 Conteúdo Exclusivo
            </span>
          </div>
        )}

        {/* Pending release overlay */}
        {isPendingRelease && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 transition-all duration-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/25">
              <Clock className="h-6 w-6 text-blue-400/70" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-300/50 bg-black/30 rounded-full px-4 py-1.5 border border-blue-500/15">
              {daysLeft !== null && daysLeft > 0
                ? `⏳ Libera em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`
                : '⏳ Liberação em breve'}
            </span>
            {item.unlockDate && (
              <span className="text-[9px] text-blue-300/40">
                Disponível em {new Date(item.unlockDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        )}

        {/* Unlock rule overlay */}
        {isRuleLocked && !isPendingRelease && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 transition-all duration-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25">
              <Lock className="h-6 w-6 text-amber-400/70" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300/50 bg-black/30 rounded-full px-4 py-1.5 border border-amber-500/15 text-center max-w-[85%]">
              🔗 {item.unlockRuleMessage}
            </span>
          </div>
        )}
      </div>

      {/* Content info */}
      <div className="relative p-5 sm:p-6 flex flex-col flex-1">
        <h3 className={`font-display text-[16px] sm:text-[17px] font-bold tracking-tight leading-snug transition-colors duration-500 ${
          isPaidLocked ? "text-foreground/60 group-hover:text-foreground/75" :
          isLocked ? "text-foreground/50" : "text-foreground/85 group-hover:text-foreground"
        }`}>
          {item.title}
        </h3>

        {item.description && (
          <p className={`mt-2.5 text-[12px] leading-[1.9] line-clamp-2 transition-colors duration-500 flex-1 ${
            isPaidLocked ? "text-muted-foreground/30 group-hover:text-muted-foreground/40" :
            isLocked ? "text-muted-foreground/25" : "text-muted-foreground/35 group-hover:text-muted-foreground/45"
          }`}>
            {item.description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 pt-3.5 border-t border-border/6 flex items-center gap-3">
          {isUnlocked ? (
            <>
              {item.file_url && (
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-gold/55 hover:text-gold/80 transition-colors duration-500"
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
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-gold/55 hover:text-gold/80 transition-colors duration-500"
                >
                  <Play className="h-3 w-3" />
                  Assistir
                </a>
              )}
              {!item.file_url && !item.video_url && (
                <span className="text-[10px] text-muted-foreground/25 tracking-wider uppercase">
                  Disponível
                </span>
              )}
            </>
          ) : isPendingRelease ? (
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-blue-400/45">
              <Clock className="h-3 w-3" />
              Em breve
            </span>
          ) : isPaidLocked ? (
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-gold/50 group-hover:text-gold/70 transition-colors duration-500">
              <Sparkles className="h-3 w-3" />
              {item.sales_page_url ? "Desbloquear acesso" : "Tornar-se membro"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-gold/45">
              <ShoppingCart className="h-3 w-3" />
              {item.sales_page_url ? "Adquirir Acesso" : "Conteúdo Exclusivo"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}