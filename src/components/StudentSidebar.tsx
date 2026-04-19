import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { listActiveTracks } from "@/lib/tracks.functions";
import { useProjectMode, type ModuleKey } from "@/hooks/use-project-mode";
import { LogoBrand } from "./LogoBrand";
import {
  Store,
  GraduationCap,
  Music2,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Route as RouteIcon,
  Users,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
...
  // Separate perfil from main items (goes after separator)
  const mainItems = visibleMenuItems.filter((cfg) => cfg.key !== "perfil");
  const showPerfil = visibleMenuItems.some((cfg) => cfg.key === "perfil");

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-7 pt-8 pb-6 border-b border-white/[0.06]">
        <LogoBrand size="lg" showSubtitle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-5 pt-6 pb-4 space-y-2">
        {/* Dynamic module items */}
        {mainItems.map((cfg) =>
          cfg.hasSubmenu ? (
            <div key={cfg.key}>{renderLouvoresSubmenu()}</div>
          ) : (
            renderMenuItem(cfg)
          )
        )}

        {/* Separator */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Perfil */}
        {showPerfil && (
          <Link
            to="/perfil"
            onClick={() => setMobileOpen(false)}
            className={navItemClass(isActive("/perfil"))}
          >
            <UserCircle className="h-[22px] w-[22px] shrink-0" />
            Perfil
          </Link>
        )}

        {/* Admin */}
        {!adminLoading && isAdmin && (
          <>
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={navItemClass(isActivePrefix("/admin"))}
            >
              <Settings className="h-[22px] w-[22px] shrink-0" />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-5 py-6 border-t border-white/[0.06]">
        <button
          onClick={() => { logout(); setMobileOpen(false); }}
          className="flex items-center gap-4 rounded-2xl px-5 py-3.5 w-full text-[14px] font-semibold text-muted-foreground/40 hover:text-foreground/60 hover:bg-white/[0.04] transition-all duration-300"
        >
          <LogOut className="h-[20px] w-[20px] shrink-0" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 bg-background/95 backdrop-blur-2xl border-b border-white/[0.06] md:hidden safe-area-top">
        <LogoBrand size="sm" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-colors active:scale-95"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[320px] bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[310px] md:min-h-screen bg-sidebar border-r border-white/[0.05] shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
