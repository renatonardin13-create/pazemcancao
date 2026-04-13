import { LogoBrand } from "./LogoBrand";
import { LogOut, Settings, UserCircle, Headphones, BookOpen, GraduationCap, Menu, X } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "./NotificationBell";
import { useState } from "react";

interface AppHeaderProps {
  showLogout?: boolean;
}

export function AppHeader({ showLogout = true }: AppHeaderProps) {
  const { logout, isAdmin, adminLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/musicas" as const, icon: Headphones, label: "Músicas" },
    { to: "/conteudo" as const, icon: BookOpen, label: "Conteúdos" },
    { to: "/cursos" as const, icon: GraduationCap, label: "Cursos" },
    { to: "/perfil" as const, icon: UserCircle, label: "Perfil" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/12 to-transparent" />

      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <LogoBrand size="md" showSubtitle />

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <NotificationBell />

          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-500 ${
                isActive(to)
                  ? "text-gold/70 bg-gold/[0.06]"
                  : "text-muted-foreground/35 hover:text-gold/60 hover:bg-muted/15"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline text-[10px] font-semibold uppercase tracking-[0.15em]">
                {label}
              </span>
            </Link>
          ))}

          {!adminLoading && isAdmin && (
            <Link
              to="/admin"
              className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-500 ${
                location.pathname.startsWith("/admin")
                  ? "text-gold/70 bg-gold/[0.06]"
                  : "text-muted-foreground/35 hover:text-gold/60 hover:bg-muted/15"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline text-[10px] font-semibold uppercase tracking-[0.15em]">
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
              <span className="hidden md:inline text-[10px] font-semibold uppercase tracking-[0.15em]">
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
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/40 hover:text-foreground/60 hover:bg-muted/15 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border/10 bg-background/95 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col py-2 px-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                  isActive(to)
                    ? "text-gold/70 bg-gold/[0.06]"
                    : "text-muted-foreground/50 hover:text-foreground/70 hover:bg-muted/10"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.15em]">
                  {label}
                </span>
              </Link>
            ))}

            {!adminLoading && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                  location.pathname.startsWith("/admin")
                    ? "text-gold/70 bg-gold/[0.06]"
                    : "text-muted-foreground/50 hover:text-foreground/70 hover:bg-muted/10"
                }`}
              >
                <Settings className="h-4.5 w-4.5" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.15em]">
                  Admin
                </span>
              </Link>
            )}

            {showLogout && (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground/40 hover:text-muted-foreground/60 hover:bg-muted/10 transition-all duration-300"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.15em]">
                  Sair
                </span>
              </button>
            )}
          </nav>
        </div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </header>
  );
}
