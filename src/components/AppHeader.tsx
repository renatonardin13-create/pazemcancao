import { LogoBrand } from "./LogoBrand";
import { LogOut, Settings, UserCircle, Headphones, GraduationCap, Menu, X } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProjectMode } from "@/hooks/use-project-mode";
import { NotificationBell } from "./NotificationBell";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  showLogout?: boolean;
}

export function AppHeader({ showLogout = true }: AppHeaderProps) {
  const { logout, isAdmin, adminLoading } = useAuth();
  const { showMusicInMenu, showCoursesInMenu, showPerfilInMenu } = useProjectMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = useMemo(() => {
    const items: { to: string; icon: typeof Headphones; label: string }[] = [];
    const prefix = "";
    
    if (showMusicInMenu) items.push({ to: "/musicas", icon: Headphones, label: "Músicas" });
    if (showCoursesInMenu) items.push({ to: "/cursos", icon: GraduationCap, label: "Cursos" });
    if (showPerfilInMenu) items.push({ to: "/perfil", icon: UserCircle, label: "Perfil" });
    return items;
  }, [showMusicInMenu, showCoursesInMenu, showPerfilInMenu]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200",
      active
        ? "text-gold bg-gold/10 shadow-sm shadow-gold/5"
        : "text-muted-foreground/60 hover:text-foreground/80 hover:bg-muted/10"
    );

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/15">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
        <LogoBrand size="md" showSubtitle linkTo="/home" />

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <NotificationBell />

          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={navLinkClass(isActive(to))}>
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline tracking-wide uppercase">
                {label}
              </span>
            </Link>
          ))}

          {!adminLoading && isAdmin && (
            <Link to="/admin" className={navLinkClass(location.pathname.startsWith("/admin"))}>
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline tracking-wide uppercase">
                Admin
              </span>
            </Link>
          )}

          {showLogout && (
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-muted-foreground/50 hover:text-foreground/60 hover:bg-muted/10 transition-all duration-200 ml-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline text-xs font-semibold tracking-wide uppercase">
                Sair
              </span>
            </button>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/15 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border/15 bg-background/95 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col py-2 px-4 space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all duration-200",
                  isActive(to)
                    ? "text-gold bg-gold/10"
                    : "text-muted-foreground/50 hover:text-foreground/70 hover:bg-muted/10"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}

            {!adminLoading && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all duration-200",
                  location.pathname.startsWith("/admin")
                    ? "text-gold bg-gold/10"
                    : "text-muted-foreground/50 hover:text-foreground/70 hover:bg-muted/10"
                )}
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}

            {showLogout && (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-semibold text-muted-foreground/50 hover:text-foreground/60 hover:bg-muted/10 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}