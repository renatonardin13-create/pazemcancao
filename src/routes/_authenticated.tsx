import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { RestrictedAccessCard } from "@/components/RestrictedAccessCard";
import { checkBuyerAccess } from "@/lib/access.functions";
import { useQuery } from "@tanstack/react-query";
import { LogOut, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, loading, logout, user, blocked, blockMessage } = useAuth();
  const navigate = useNavigate();

  const { data: accessData, isLoading: accessLoading } = useQuery({
    queryKey: ["buyer-access", user?.email],
    queryFn: () => checkBuyerAccess(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  if (loading || (isAuthenticated && accessLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.025,transparent_70%)]" />
        <div className="relative flex flex-col items-center gap-6 animate-in fade-in duration-1000">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-gold/15 to-transparent animate-breathe" />
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-gold/25">
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
            <h2 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
              Acesso não autorizado detectado
            </h2>
            <div className="mx-auto mt-5 h-px w-10 bg-gradient-to-r from-transparent via-destructive/20 to-transparent" />
            <p className="mt-6 text-[14px] leading-[2] text-muted-foreground/60 font-light">
              {blockMessage}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <a
                href="mailto:suporte@pazemcancao.com"
                className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/45 hover:text-gold/65 transition-colors duration-500"
              >
                Falar com suporte
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground/35 hover:text-muted-foreground/55 transition-colors duration-500"
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

  if (!accessData?.hasAccess) {
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
          <p className="mt-6 text-[14px] leading-[2] text-muted-foreground/40 font-light">
            Não encontramos uma compra válida vinculada a este e-mail.
          </p>
          <p className="mt-3 text-[13px] leading-[1.8] text-muted-foreground/30 font-light">
            Se você já realizou a compra, aguarde alguns minutos ou entre em contato com o suporte.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href="mailto:suporte@pazemcancao.com"
              className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold/35 hover:text-gold/55 transition-colors duration-500"
            >
              Falar com suporte
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground/25 hover:text-muted-foreground/45 transition-colors duration-500"
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
