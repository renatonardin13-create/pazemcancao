import { LogoBrand } from "./LogoBrand";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AppHeaderProps {
  showLogout?: boolean;
}

export function AppHeader({ showLogout = true }: AppHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl">
      {/* Whisper-thin gold accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/12 to-transparent" />

      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
        <LogoBrand size="md" showSubtitle />

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

      <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </header>
  );
}
