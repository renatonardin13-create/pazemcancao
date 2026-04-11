import { motion } from "framer-motion";
import { Lock, Download, Play, ShoppingCart, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ContentCardProps {
  item: any;
  index: number;
  hasAccess: boolean;
  gradient: string;
  TypeIcon: LucideIcon;
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

export function ContentCard({ item, index, hasAccess, gradient, TypeIcon }: ContentCardProps) {
  const embedUrl = item.video_url ? getYouTubeEmbedUrl(item.video_url) : null;
  
  // unlocked field comes from server: true if free, admin, or release_days passed
  const isUnlocked = item.unlocked !== undefined ? item.unlocked : (item.is_free || hasAccess);
  const isLocked = !isUnlocked;
  const isPendingRelease = hasAccess && !item.is_free && item.release_days && !isUnlocked;

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
      whileHover={{ scale: isLocked ? 1.01 : 1.03, y: isLocked ? -2 : -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={isLocked ? handleLockedClick : undefined}
      className={`group relative rounded-3xl border overflow-hidden h-full flex flex-col transition-all duration-700 ${
        isLocked
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
            {item.cover_url && (
              <img
                src={item.cover_url}
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

        {/* Free badge */}
        {item.is_free && (
          <span className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-widest text-emerald-300/80 bg-emerald-500/15 backdrop-blur-sm border border-emerald-500/20 rounded-full px-3 py-1">
            Gratuito
          </span>
        )}

        {/* Lock overlay for paid content */}
        {isLocked && !isPendingRelease && (
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
              ⏳ Liberação em breve
            </span>
            {item.unlockDate && (
              <span className="text-[9px] text-blue-300/40">
                Disponível em {new Date(item.unlockDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content info */}
      <div className="relative p-5 sm:p-6 flex flex-col flex-1">
        <h3 className={`font-display text-[16px] sm:text-[17px] font-bold tracking-tight leading-snug transition-colors duration-500 ${
          isLocked ? "text-foreground/50" : "text-foreground/85 group-hover:text-foreground"
        }`}>
          {item.title}
        </h3>

        {item.description && (
          <p className={`mt-2.5 text-[12px] leading-[1.9] line-clamp-2 transition-colors duration-500 flex-1 ${
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
