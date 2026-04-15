import { useQuery } from "@tanstack/react-query";
import { getUpsellsForProduct, type UpsellItem } from "@/lib/upsell.functions";
import { Link } from "@tanstack/react-router";
import { Sparkles, Lock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface UpsellSectionProps {
  sourceType: "course" | "content" | "track";
  sourceId: string;
  className?: string;
}

export function UpsellSection({ sourceType, sourceId, className = "" }: UpsellSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["upsells", sourceType, sourceId],
    queryFn: () => getUpsellsForProduct({ data: { sourceType, sourceId } }),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const upsells = data?.upsells || [];

  if (isLoading || upsells.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className={`${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-gold/70" />
        <h3 className="text-sm font-bold text-foreground/80 tracking-tight">
          Você também pode gostar de...
        </h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {upsells.map((item) => (
          <UpsellCard key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
}

function UpsellCard({ item }: { item: UpsellItem }) {
  const hasExternalLink = !!item.target_sales_url;

  const linkTo = item.target_type === "course"
    ? `/cursos/${item.target_id}`
    : item.target_type === "track"
      ? `/musicas/${item.target_id}`
      : `/conteudo/${item.target_id}`;

  const content = (
    <div className="group relative w-[180px] shrink-0 snap-start rounded-xl border border-border/15 bg-card/40 hover:bg-card/70 hover:border-gold/20 transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Cover */}
      <div className="aspect-[16/10] relative overflow-hidden bg-muted/10">
        {item.target_cover ? (
          <img
            src={item.target_cover}
            alt={item.target_title || ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-muted-foreground/20" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs font-bold text-foreground/90 line-clamp-2 leading-tight">
          {item.target_title || "Conteúdo"}
        </p>
        {item.description && (
          <p className="text-[10px] text-muted-foreground/60 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* CTA */}
        <div className="pt-1">
          {hasExternalLink ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold/80 group-hover:text-gold transition-colors">
              <Lock className="h-2.5 w-2.5" />
              Desbloquear agora
              <ExternalLink className="h-2.5 w-2.5" />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold/80 group-hover:text-gold transition-colors">
              <Sparkles className="h-2.5 w-2.5" />
              Ver conteúdo
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (hasExternalLink) {
    return (
      <a
        href={item.target_sales_url!}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={linkTo as any}>
      {content}
    </Link>
  );
}
