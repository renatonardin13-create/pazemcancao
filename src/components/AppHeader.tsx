import { LogoBrand } from "./LogoBrand";
import { LogOut, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AppHeaderProps {
  showLogout?: boolean;
}

export function AppHeader({ showLogout = true }: AppHeaderProps) {
  const { logout, user } = useAuth();

  const { data: roleData } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      return { isAdmin: !!data };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/12 to-transparent" />

      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
        <LogoBrand size="md" showSubtitle />

        <div className="flex items-center gap-1">
          {roleData?.isAdmin && (
            <Link
              to="/admin"
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-muted-foreground/35 hover:text-gold/60 hover:bg-muted/15 transition-all duration-500"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.15em]">
                Admin
              </span>
            </Link>
          )}

          {showLogout && (
            <button
              onClick={() => logout()}
              className="group flex items-center gap-2 rounded-xl px-3.5 py-2 text-muted-foreground/35 hover:text-muted-foreground/60 hover:bg-muted/15 transition-all duration-500 active:scale-95"
            >
              <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.15em]">
                Sair
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </header>
  );
}
