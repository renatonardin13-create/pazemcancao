import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { RestrictedAccessCard } from "@/components/RestrictedAccessCard";
import { checkBuyerAccess } from "@/lib/access.functions";
import { useEffect, useState, useRef } from "react";
import { LogOut, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { SafeBoundary } from "@/components/SafeBoundary";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, loading, isAdmin, logout, user, blocked, blockMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [accessData, setAccessData] = useState<{ hasAccess: boolean; buyer: any } | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessCheckFailed, setAccessCheckFailed] = useState(false);
  const lastCheckedEmail = useRef<string | null>(null);
  const welcomeShown = useRef(false);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isMusicExperience = location.pathname === "/musicas" || location.pathname.startsWith("/louvor/");
  const isVitrineRoute = location.pathname === "/home" || location.pathname.startsWith("/home/") || location.pathname === "/vitrine";
  const isCursosRoute = location.pathname === "/cursos" || location.pathname.startsWith("/cursos/");
  
  const skipAccessGate = isMusicExperience || isVitrineRoute || isCursosRoute || isAdminRoute;

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin && !isAdminRoute && !skipAccessGate) {
      navigate({ to: "/admin" });
    }
  }, [loading, isAuthenticated, isAdmin, isAdminRoute, skipAccessGate, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccessData(null);
      setAccessLoading(false);
      lastCheckedEmail.current = null;
      return;
    }

    if (isAdmin) {
      setAccessData({ hasAccess: true, buyer: { nome: "Administrador" } });
      setAccessLoading(false);
      setAccessCheckFailed(false);
      return;
    }

    const currentEmail = user?.email ?? null;
    if (currentEmail && currentEmail === lastCheckedEmail.current && accessData !== null) {
      return;
    }

    let cancelled = false;
    setAccessLoading(true);
    setAccessCheckFailed(false);

    checkBuyerAccess().then((result) => {
      if (!cancelled) {
        setAccessData(result);
        setAccessLoading(false);
        setAccessCheckFailed(false);
        lastCheckedEmail.current = currentEmail;
      }
    }).catch((err) => {
      console.error("Access check failed:", err);
      if (!cancelled) {
        setAccessCheckFailed(true);
        setAccessLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAdmin, user?.email]);

  useEffect(() => {
    if (!loading && !isAuthenticated && !blocked) {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, blocked, navigate]);

  if (loading || (isAuthenticated && !isAdmin && accessLoading && !skipAccessGate)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <p className="text-xs font-medium uppercase tracking-widest text-gold/70">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (accessCheckFailed && !skipAccessGate) {
    return <RestrictedAccessCard />;
  }

  if (!isAuthenticated || blocked) {
    if (blocked && blockMessage) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8 text-center">
          <div>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Acesso Bloqueado</h2>
            <p className="text-muted-foreground">{blockMessage}</p>
            <button onClick={() => logout()} className="mt-6 text-sm underline">Sair</button>
          </div>
        </div>
      );
    }
    return <RestrictedAccessCard />;
  }

  if (!skipAccessGate && !isAdmin && !accessData?.hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Acesso não autorizado</h2>
          <p className="text-muted-foreground mb-6">Este e-mail não possui compra registrada.</p>
          <button onClick={() => logout()} className="text-sm underline">Sair</button>
        </div>
      </div>
    );
  }

  return (
    <SafeBoundary fallbackTitle="Erro ao carregar a área do aluno">
      <Outlet />
    </SafeBoundary>
  );
}