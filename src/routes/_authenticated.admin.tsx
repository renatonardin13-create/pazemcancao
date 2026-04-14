import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { LogOut, ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, adminLoading, logout, user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 600);
  };

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-xs uppercase tracking-[0.4em] text-gold/70 animate-pulse">
          Verificando acesso...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.02,transparent_70%)]" />
        <div className="relative text-center max-w-sm px-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <ShieldAlert className="h-8 w-8 text-destructive/50 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Acesso restrito
          </h1>
          <div className="mx-auto mt-4 h-px w-10 bg-gradient-to-r from-transparent via-destructive/20 to-transparent" />
          <p className="mt-5 text-[14px] leading-[2] text-muted-foreground/50 font-light">
            Você não tem permissão de administrador para acessar esta área.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/downloads"
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-gold/45 hover:text-gold/65 transition-colors duration-500"
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-muted-foreground/50 transition-colors duration-500"
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-14 flex items-center gap-3 border-b border-border/30 bg-background/80 backdrop-blur-xl px-4">
            <SidebarTrigger className="text-muted-foreground/70 hover:text-muted-foreground/70" />
            <div className="h-4 w-px bg-border/20" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground/60">
              Painel Administrativo
            </span>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-muted-foreground/60 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground/60 transition-colors"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-3 sm:p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
