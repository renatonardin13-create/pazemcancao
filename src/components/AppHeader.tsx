import { LogoBrand } from "./LogoBrand";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AppHeaderProps {
  showLogout?: boolean;
}

export function AppHeader({ showLogout = true }: AppHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
        <LogoBrand size="md" showSubtitle />
        {showLogout && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground/70 uppercase text-[10px] sm:text-xs font-semibold tracking-wider hover:text-foreground rounded-xl"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        )}
      </div>
    </header>
  );
}
