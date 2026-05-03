import { useProjectMode, type ModuleKey } from "@/hooks/use-project-mode";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

interface ModuleGuardProps {
  moduleKey: ModuleKey;
  children: React.ReactNode;
}

/**
 * Wraps a route component. If the module is disabled, redirects to /vitrine
 * (or shows a brief message while redirecting).
 */
export function ModuleGuard({ moduleKey, children }: ModuleGuardProps) {
  const { modules, isLoading } = useProjectMode();
  const navigate = useNavigate();
  const enabled = modules[moduleKey];

  useEffect(() => {
    if (!isLoading && !enabled) {
      navigate({ to: "/home" });
    }
  }, [isLoading, enabled, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
          Carregando...
        </p>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center px-8">
          <ShieldAlert className="h-8 w-8 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/60">
            Este módulo não está disponível.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
