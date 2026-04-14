import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { RestrictedAccessCard } from "@/components/RestrictedAccessCard";
import { checkBuyerAccess } from "@/lib/access.functions";
import { useEffect, useState, useRef } from "react";
import { LogOut, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, loading, adminLoading, isAdmin, logout, user, blocked, blockMessage } = useAuth();
  const navigate = useNavigate();

  const [accessData, setAccessData] = useState<{ hasAccess: boolean; buyer: any; isTrial?: boolean; trialExpired?: boolean; canDownload?: boolean; trialExpiresAt?: string | null } | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const lastCheckedEmail = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccessData(null);
      setAccessLoading(false);
      lastCheckedEmail.current = null;
      return;
    }

    if (adminLoading) {
      setAccessLoading(true);
      return;
    }

    if (isAdmin) {
      setAccessData({ hasAccess: true, buyer: { nome: "Administrador", product_name: null } });
      setAccessLoading(false);
      lastCheckedEmail.current = user?.email ?? null;
      return;
    }

    // Prevent duplicate checks for the same email
    const currentEmail = user?.email ?? null;
    if (currentEmail && currentEmail === lastCheckedEmail.current && accessData !== null) {
      return;
    }

    let cancelled = false;
    setAccessLoading(true);

    checkBuyerAccess().then((result) => {
      if (!cancelled) {
        setAccessData(result);
        setAccessLoading(false);
        lastCheckedEmail.current = currentEmail;
      }
    }).catch((err) => {
      console.error("Access check failed:", err);
      if (!cancelled) {
        // On error, don't block — retry will happen on next render
        setAccessData(null);
        setAccessLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [isAuthenticated, adminLoading, isAdmin, user?.email]);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!loading && !isAuthenticated && !blocked) {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, blocked, navigate]);

  if (loading || adminLoading || (isAuthenticated && !isAdmin && accessLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.025,transparent_70%)]" />
        <div className="relative flex flex-col items-center gap-6 animate-in fade-in duration-1000">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-gold/15 to-transparent animate-breathe" />
          <p className="text-[11px] font-medium uppercase tracking-widest text-gold/25">
            Preparando seu espaço
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || blocked) {
    if (blocked && blockMessage) {
      const handleLogout = async () => {
        await logout();
        navigate({ to: "/login" });
      };

      return (
        <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.025,transparent_70%)]" />
          <div className="relative max-w-sm text-center px-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="mx-auto mb-8 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive/60" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Acesso não autorizado detectado
            </h2>
            <div className="mx-auto mt-5 h-px w-10 bg-gradient-to-r from-transparent via-destructive/20 to-transparent" />
            <p className="mt-6 text-[14px] leading-[2] text-muted-foreground/60 font-light">
              {blockMessage}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <a
                href={`https://wa.me/5517988308037?text=${encodeURIComponent('Olá, preciso de ajuda para acessar o Paz em Canção')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15 px-5 py-2.5 text-[11px] font-semibold tracking-wider uppercase hover:bg-emerald-500/20 hover:text-emerald-400/90 transition-all duration-500"
              >
                Falar com Suporte
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/35 hover:text-muted-foreground/55 transition-colors duration-500"
              >
                <LogOut className="h-3 w-3" />
                Sair
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <RestrictedAccessCard />;
  }

  if (!isAdmin && !accessData?.hasAccess) {
    const handleLogout = async () => {
      await logout();
      navigate({ to: "/login" });
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.025,transparent_70%)]" />
        <div className="relative max-w-sm text-center px-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="mx-auto mb-10 w-px h-16 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
          <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Acesso não autorizado
          </h2>
          <div className="mx-auto mt-5 h-px w-10 bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
          <p className="mt-6 text-[14px] leading-[2] text-muted-foreground/40 font-light">
            Este e-mail não possui compra registrada.<br />
            Se você já comprou, use o e-mail da compra.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href="https://pazemcancao-oficial.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-6 py-2.5 text-[11px] font-semibold tracking-wider uppercase hover:bg-gold/22 hover:text-gold/80 transition-all duration-500"
            >
              Adquira aqui
            </a>
            <a
              href={`https://wa.me/5517988308037?text=${encodeURIComponent('Olá, preciso de ajuda para acessar o Paz em Canção')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15 px-5 py-2.5 text-[11px] font-semibold tracking-wider uppercase hover:bg-emerald-500/20 hover:text-emerald-400/90 transition-all duration-500"
            >
              Suporte: (17) 98830-8037
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/25 hover:text-muted-foreground/45 transition-colors duration-500 mt-2"
            >
              <LogOut className="h-3 w-3" />
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
