import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Music, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
            <Lock className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Acesso restrito
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Esta área é exclusiva para compradores autorizados.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Music className="h-4 w-4" />
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
