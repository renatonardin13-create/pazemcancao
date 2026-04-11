import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listContentItems } from "@/lib/content.functions";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { ContentCard } from "@/components/ContentCard";
import { BookOpen, Video, GraduationCap, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conteudo/")({
  component: ContentPage,
});

const typeConfig: Record<string, { label: string; icon: any; gradient: string }> = {
  ebook: { label: "E-books", icon: BookOpen, gradient: "from-blue-900/40 via-blue-950/30 to-slate-950/50" },
  video: { label: "Videoaulas", icon: Video, gradient: "from-purple-900/40 via-purple-950/30 to-slate-950/50" },
  free_lesson: { label: "Aulas Gratuitas", icon: GraduationCap, gradient: "from-emerald-900/40 via-emerald-950/30 to-slate-950/50" },
  material: { label: "Materiais", icon: FileText, gradient: "from-amber-900/40 via-amber-950/30 to-slate-950/50" },
};

const categoryLabels: Record<string, string> = {
  bonus_exclusivos: "🎁 Bônus Exclusivos",
  soldado_ferido: "⚔️ Soldado Ferido",
  ansiedade: "🧘 Ansiedade",
  cura_da_alma: "💚 Cura da Alma",
  refugio: "🏠 Refúgio",
  nao_desista: "💪 Não Desista",
  destaques: "⭐ Destaques",
  geral: "📂 Geral",
};

function ContentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["content-items"],
    queryFn: () => listContentItems(),
  });

  const hasAccess = data?.hasFullAccess ?? false;
  const allItems = data?.items || [];

  // Filter only items with show_as_card !== false
  const items = allItems.filter((item: any) => item.show_as_card !== false);

  // Sort helper: sort_order ascending, then created_at descending for items without order
  const sortItems = (a: any, b: any) => {
    const orderA = a.sort_order ?? 9999;
    const orderB = b.sort_order ?? 9999;
    if (orderA !== orderB) return orderA - orderB;
    // Fallback: most recent first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  // Group by display_category first, then by content_type for items without category
  const categorizedItems: Record<string, any[]> = {};
  const uncategorizedItems: Record<string, any[]> = {};

  items.forEach((item: any) => {
    const category = item.display_category;
    if (category && category !== "none") {
      if (!categorizedItems[category]) categorizedItems[category] = [];
      categorizedItems[category].push(item);
    } else {
      const type = item.content_type || "material";
      if (!uncategorizedItems[type]) uncategorizedItems[type] = [];
      uncategorizedItems[type].push(item);
    }
  });

  // Sort items within each group
  Object.values(categorizedItems).forEach(arr => arr.sort(sortItems));
  Object.values(uncategorizedItems).forEach(arr => arr.sort(sortItems));

  const hasCategorized = Object.keys(categorizedItems).length > 0;
  const hasUncategorized = Object.keys(uncategorizedItems).length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-12">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground/85 tracking-tight">
            Conteúdos Exclusivos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground/40">
            E-books, videoaulas e materiais para sua jornada espiritual
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
              Carregando conteúdos...
            </p>
          </div>
        ) : !items.length ? (
          <div className="text-center py-16 rounded-2xl border border-border/15 bg-card/5">
            <BookOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground/35">Nenhum conteúdo disponível ainda.</p>
          </div>
        ) : (
          <>
            {/* Categorized sections */}
            {hasCategorized && Object.entries(categorizedItems).map(([category, catItems]) => {
              const categoryLabel = categoryLabels[category] || category;
              // Use the first item's type for the icon/gradient fallback
              const firstType = catItems[0]?.content_type || "material";
              const config = typeConfig[firstType] || typeConfig.material;

              return (
                <section key={category} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
                      {categoryLabel}
                    </h2>
                    <span className="text-[10px] text-muted-foreground/25">{catItems.length} item(ns)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {catItems.map((item: any, idx: number) => {
                      const itemConfig = typeConfig[item.content_type] || typeConfig.material;
                      return (
                        <ContentCard
                          key={item.id}
                          item={item}
                          index={idx}
                          hasAccess={item.is_free || item.access_mode === 'gratuito' || hasAccess}
                          gradient={itemConfig.gradient}
                          TypeIcon={itemConfig.icon}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Uncategorized sections — grouped by content_type */}
            {hasUncategorized && Object.entries(uncategorizedItems).map(([type, typeItems]) => {
              const config = typeConfig[type] || typeConfig.material;
              const TypeIcon = config.icon;

              return (
                <section key={type} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/15">
                      <TypeIcon className="h-4 w-4 text-gold/50" />
                    </div>
                    <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
                      {config.label}
                    </h2>
                    <span className="text-[10px] text-muted-foreground/25">{typeItems.length} item(ns)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {typeItems.map((item: any, idx: number) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        index={idx}
                        hasAccess={item.is_free || item.access_mode === 'gratuito' || hasAccess}
                        gradient={config.gradient}
                        TypeIcon={config.icon}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>

      <FooterLinks />
    </div>
  );
}
