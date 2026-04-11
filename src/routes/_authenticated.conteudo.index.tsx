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

function ContentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["content-items"],
    queryFn: () => listContentItems(),
  });

  const hasAccess = data?.hasFullAccess ?? false;
  const items = data?.items || [];

  const groupedItems = items.reduce((acc: Record<string, any[]>, item: any) => {
    const type = item.content_type || "material";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

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
          Object.entries(groupedItems).map(([type, typeItems]) => {
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
                      hasAccess={item.is_free || hasAccess}
                      gradient={config.gradient}
                      TypeIcon={config.icon}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      <FooterLinks />
    </div>
  );
}
