import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { RestrictedAccessCard } from "@/components/RestrictedAccessCard";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
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

  if (!isAuthenticated) {
    return <RestrictedAccessCard />;
  }

  return <Outlet />;
}
