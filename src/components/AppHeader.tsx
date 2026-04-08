import { LogoBrand } from "./LogoBrand";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AppHeaderProps {
  showLogout?: boolean;
}

export function AppHeader({ showLogout = true }: AppHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gold/[0.08] bg-background/70 backdrop-blur-2xl">
      {/* Top gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
        <LogoBrand size="md" showSubtitle />

        {showLogout && (
          <button
            onClick={() => logout()}
            className="group flex items-center gap-2 rounded-xl px-3.5 py-2 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30 transition-all duration-300 active:scale-95"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.15em]">
              Sair
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
