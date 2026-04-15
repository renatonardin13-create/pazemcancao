import { createFileRoute } from "@tanstack/react-router";
import { ModuleGuard } from "@/components/ModuleGuard";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/comunidade")({
  component: ComunidadePage,
});

function ComunidadePage() {
  return (
    <ModuleGuard moduleKey="comunidade">
      <StudentLayout>
        <div className="min-h-screen flex flex-col bg-background">
          <div className="flex-1 w-full pb-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12">
              <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
                <Users className="h-7 w-7 text-gold" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                    Comunidade
                  </h1>
                  <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                    Conecte-se com outros membros
                  </p>
                </div>
              </div>

              <div className="text-center py-24">
                <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-5" />
                <p className="text-sm text-muted-foreground/60 mb-2">
                  A comunidade está sendo preparada com carinho.
                </p>
                <p className="text-xs text-muted-foreground/40">
                  Em breve você poderá se conectar com outros membros.
                </p>
              </div>
            </div>
          </div>
          <FooterLinks />
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
