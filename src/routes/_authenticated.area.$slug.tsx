import { createFileRoute, Outlet, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import { useEffect, ReactNode } from "react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { AppHeader } from "@/components/AppHeader";
import { GlobalPlayer } from "@/components/GlobalPlayer";

export const Route = createFileRoute("/_authenticated/area/$slug")({
  component: AreaLayout,
});

function AreaLayout() {
  const { slug } = useParams({ from: "/_authenticated/area/$slug" });
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

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
      // Generate some variations if needed, or just use the primary
    }
    return () => {
      document.documentElement.style.removeProperty("--primary");
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
        <div className="relative max-w-sm text-center px-8">
          <div className="mx-auto mb-8 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive/60" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Acesso Restrito
          </h2>
          <p className="mt-6 text-[14px] leading-[2] text-muted-foreground/60 font-light">
            Você não tem permissão para acessar esta área de membros. 
            Entre em contato com o administrador se você acredita que isso é um erro.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/70 hover:text-muted-foreground/55 transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Sair
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
