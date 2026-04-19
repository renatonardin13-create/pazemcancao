import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useCardsConfig } from "@/hooks/use-cards-config";
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
  const { isAuthenticated, loading, adminLoading, isAdmin, logout, user, blocked, blockMessage } = useAuth();
  // Carrega cards_config global do admin (popula cache para PosterCard)
  useCardsConfig();
  const navigate = useNavigate();
  const location = useLocation();

  const [accessData, setAccessData] = useState<{ hasAccess: boolean; buyer: any; isTrial?: boolean; trialExpired?: boolean; canDownload?: boolean; trialExpiresAt?: string | null } | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessCheckFailed, setAccessCheckFailed] = useState(false);
  const lastCheckedEmail = useRef<string | null>(null);
  const welcomeShown = useRef(false);
  const isMusicExperience = location.pathname === "/musicas" || location.pathname.startsWith("/louvor/");
  const isAdminRoute = location.pathname.startsWith("/admin");
  // /vitrine é a tela "catálogo público" para aluno autenticado: não pode ficar
  // refém do loader bloqueante de checkBuyerAccess. A própria vitrine já tem
  // skeleton/empty-state elegantes, então liberamos o Outlet imediatamente
  // (assim como já fazemos para a experiência musical).
  const isVitrineRoute = location.pathname === "/vitrine" || location.pathname.startsWith("/vitrine/");
  const skipAccessGate = isMusicExperience || isVitrineRoute;

  // Admin acessando rota de aluno → redireciona para /admin (evita tela preta e conflito de contexto)
  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin && !isAdminRoute) {
      navigate({ to: "/admin" });
    }
  }, [loading, isAuthenticated, isAdmin, isAdminRoute, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAccessData(null);
      setAccessLoading(false);
      lastCheckedEmail.current = null;
      return;
    }

    if (isAdmin) {
      setAccessData({ hasAccess: true, buyer: { nome: "Administrador", product_name: null } });
      setAccessLoading(false);
      setAccessCheckFailed(false);
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
    setAccessCheckFailed(false);

    const timeout = setTimeout(() => {
      if (cancelled) return;
      console.error("Access check timeout:", currentEmail);
      setAccessCheckFailed(true);
      setAccessLoading(false);
      if (skipAccessGate) {
        setAccessData({ hasAccess: true, buyer: null, canDownload: false, isTrial: false, trialExpired: false, trialExpiresAt: null });
      }
    }, 8000);

    checkBuyerAccess().then((result) => {
      clearTimeout(timeout);
      if (!cancelled) {
        setAccessData(result);
        setAccessLoading(false);
        setAccessCheckFailed(false);
        lastCheckedEmail.current = currentEmail;
      }
    }).catch((err) => {
      clearTimeout(timeout);
      console.error("Access check failed:", err);
      if (!cancelled) {
        setAccessCheckFailed(true);
        if (skipAccessGate) {
          setAccessData({ hasAccess: true, buyer: null, canDownload: false, isTrial: false, trialExpired: false, trialExpiresAt: null });
        } else {
          setAccessData(null);
        }
        setAccessLoading(false);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isAuthenticated, isAdmin, user?.email, skipAccessGate]);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!loading && !isAuthenticated && !blocked) {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, blocked, navigate]);

  // Welcome toast for first-time buyers after purchase
  useEffect(() => {
    if (welcomeShown.current) return;
    if (!accessData?.hasAccess || !accessData?.buyer) return;
    if (isAdmin) return;

    const buyer = accessData.buyer;
    // Show welcome toast if buyer has never logged in before (first_login_at is null)
    if (buyer.first_login_at === null || buyer.first_login_at === undefined) {
      welcomeShown.current = true;
      toast.success("🎉 Seu conteúdo foi liberado!", {
        description: "Sua compra foi aprovada. Aproveite sua jornada espiritual!",
        duration: 6000,
      });
    }
  }, [accessData, isAdmin]);

  if (loading || (isAuthenticated && !isAdmin && accessLoading && !skipAccessGate)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.025,transparent_70%)]" />
        <div className="relative flex flex-col items-center gap-6 animate-in fade-in duration-1000">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-gold/15 to-transparent animate-breathe" />
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-gold/70">
            Preparando seu espaço
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
            <h2 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
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
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-emerald-500/20 hover:text-emerald-400/90 transition-all duration-500"
              >
                Falar com Suporte
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/70 hover:text-muted-foreground/55 transition-colors duration-500"
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

  if (!skipAccessGate && !isAdmin && !accessData?.hasAccess) {
    const handleLogout = async () => {
      await logout();
      navigate({ to: "/login" });
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.025,transparent_70%)]" />
        <div className="relative max-w-sm text-center px-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="mx-auto mb-10 w-px h-16 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
          <h2 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Acesso não autorizado
          </h2>
          <div className="mx-auto mt-5 h-px w-10 bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
          <p className="mt-6 text-[14px] leading-[2] text-muted-foreground/70 font-light">
            Este e-mail não possui compra registrada.<br />
            Se você já comprou, use o e-mail da compra.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href="https://pazemcancao-oficial.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-gold/22 hover:text-gold/80 transition-all duration-500"
            >
              Adquira aqui
            </a>
            <a
              href={`https://wa.me/5517988308037?text=${encodeURIComponent('Olá, preciso de ajuda para acessar o Paz em Canção')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-emerald-500/20 hover:text-emerald-400/90 transition-all duration-500"
            >
              Suporte: (17) 98830-8037
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-muted-foreground/45 transition-colors duration-500 mt-2"
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
    <SafeBoundary fallbackTitle="Erro ao carregar a área do aluno">
      <Outlet />
    </SafeBoundary>
  );
}
