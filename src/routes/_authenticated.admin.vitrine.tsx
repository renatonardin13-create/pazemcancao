import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Layout, Monitor, MousePointer2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin/vitrine")({
  component: AdminVitrinePage,
});

function AdminVitrinePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground tracking-tight">Vitrine</h1>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Gerencie a página inicial e destaques do aluno.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-xl border-border/20 text-[11px] font-bold uppercase tracking-widest">
            <Monitor className="h-3.5 w-3.5 mr-2" />
            Desktop
          </Button>
           <Button variant="outline" size="sm" className="rounded-xl border-border/20 text-[11px] font-bold uppercase tracking-widest">
            <Smartphone className="h-3.5 w-3.5 mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="banners" className="space-y-6">
        <TabsList className="bg-card/40 border border-border/10 p-1 rounded-2xl h-12 w-full sm:w-auto">
          <TabsTrigger value="banners" className="rounded-xl px-6 data-[state=active]:bg-gold data-[state=active]:text-background font-bold text-xs uppercase tracking-widest transition-all">Banners</TabsTrigger>
          <TabsTrigger value="prateleiras" className="rounded-xl px-6 data-[state=active]:bg-gold data-[state=active]:text-background font-bold text-xs uppercase tracking-widest transition-all">Prateleiras</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-0">
          <Card className="bg-card/40 border-border/10 rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold" />
                  Banners de Destaque
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground/60">Os banners principais que aparecem no topo da página.</CardDescription>
              </div>
              <Button size="sm" className="rounded-xl bg-gold text-background font-bold">Novo Banner</Button>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-2xl border-2 border-dashed border-border/20 flex flex-col items-center justify-center bg-black/5">
                <Layout className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-foreground/40">Nenhum banner ativo</p>
                <p className="text-[11px] text-muted-foreground/30 mt-1">Crie seu primeiro banner para começar.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prateleiras" className="mt-0">
          <Card className="bg-card/40 border-border/10 rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <MousePointer2 className="h-5 w-5 text-gold" />
                  Prateleiras de Conteúdo
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground/60">Organize como os louvores e cursos aparecem.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Lançamentos", "Mais Acessados", "Recomendados"].map((shelf) => (
                   <div key={shelf} className="flex items-center justify-between p-4 rounded-xl bg-black/5 border border-border/10 hover:border-gold/30 transition-colors cursor-grab">
                    <span className="text-sm font-bold text-foreground/80">{shelf}</span>
                    <div className="h-2 w-8 bg-muted/20 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}