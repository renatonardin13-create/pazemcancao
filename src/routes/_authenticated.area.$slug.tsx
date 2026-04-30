import { createFileRoute, Outlet, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import { useEffect, ReactNode } from "react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { AppHeader } from "@/components/AppHeader";
import { GlobalPlayer } from "@/components/GlobalPlayer";
import { useArea } from "@/providers/AreaProvider";

export const Route = createFileRoute("/_authenticated/area/$slug")({
  component: AreaLayout,
});

function AreaLayout() {
  const { slug } = useParams({ from: "/_authenticated/area/$slug" });
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { switchArea, currentArea } = useArea();

  const { data: area, isLoading: areaLoading, error: areaError } = useQuery({
    queryKey: ["area", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (area?.id && currentArea?.id !== area.id) {
      switchArea(area.id);
    }
  }, [area?.id, currentArea?.id, switchArea]);

  const { data: membership, isLoading: membershipLoading } = useQuery({
    queryKey: ["membership", area?.id, user?.id],
    enabled: !!area?.id && !!user?.id && !isAdmin,
    queryFn: async () => {
      if (!area?.id || !user?.id) return null;
      const { data, error } = await supabase
        .from("memberships")
        .select("*")
        .eq("area_id", area.id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (area?.primary_color) {
      document.documentElement.style.setProperty("--primary", area.primary_color);
      document.documentElement.style.setProperty("--gold", area.primary_color);
      document.documentElement.style.setProperty("--sidebar-primary", area.primary_color);
      document.documentElement.style.setProperty("--ring", area.primary_color);
      
      // Update gold-soft (usually primary with 10% opacity)
      const softColor = `${area.primary_color}1a`; // 1a is ~10% in hex
      document.documentElement.style.setProperty("--gold-soft", softColor);
    }
    return () => {
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--gold");
      document.documentElement.style.removeProperty("--sidebar-primary");
      document.documentElement.style.removeProperty("--ring");
      document.documentElement.style.removeProperty("--gold-soft");
    };
  }, [area?.primary_color]);

  if (areaLoading || (membershipLoading && !isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (areaError || !area) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Área não encontrada</h1>
          <p className="text-muted-foreground mb-4">A área que você está tentando acessar não existe ou foi removida.</p>
          <button onClick={() => navigate({ to: "/" })} className="text-primary hover:underline">Voltar para o início</button>
        </div>
      </div>
    );
  }

  const hasAccess = isAdmin || !!membership;

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.025,transparent_70%)]" />
        <div className="relative max-w-sm text-center px-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="mx-auto mb-10 w-px h-16 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
          <div className="mx-auto mb-8 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-destructive/40" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Acesso Restrito
          </h2>
          <div className="mx-auto mt-5 h-px w-10 bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
          <p className="mt-6 text-[14px] leading-[2] text-muted-foreground/60 font-light">
            Você não tem permissão para acessar esta área de membros.<br />
            Certifique-se de estar usando o e-mail correto ou entre em contato com o suporte.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/70 hover:text-muted-foreground/55 transition-colors duration-500"
            >
              <LogOut className="h-3 w-3" />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <GlobalPlayer />
    </div>
  );
}
