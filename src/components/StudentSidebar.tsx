import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { listActiveTracks } from "@/lib/tracks.functions";
import { listCategories } from "@/lib/courses.functions";
import { useProjectMode } from "@/hooks/use-project-mode";
import { LogoBrand } from "./LogoBrand";
import { useTranslation } from "react-i18next";
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
  Globe,
  Check,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Static lookup: slug → icon, route, prefix-match, submenu flag */
const SLUG_META: Record<string, { icon: LucideIcon; to: string; matchPrefix?: boolean }> = {
  vitrine:     { icon: Store,          to: "/home",        matchPrefix: true },
  cursos:      { icon: GraduationCap,  to: "/cursos",      matchPrefix: true },
  louvores:    { icon: Music2,         to: "/musicas",     matchPrefix: true },
  ebooks:      { icon: BookOpen,       to: "/ebooks",      matchPrefix: true },
  trilhas:     { icon: RouteIcon,      to: "/trilhas",     matchPrefix: true },
  lancamentos: { icon: Rocket,         to: "/lancamentos", matchPrefix: true },
  comunidade:  { icon: Users,          to: "/comunidade",  matchPrefix: true },
  perfil:      { icon: UserCircle,     to: "/perfil",      matchPrefix: true },
};

const OFFICIAL_LOUVOR_CATEGORIES = [
  "destaques",
  "soldado ferido",
  "ansiedade",
  "cura da alma",
  "não desista",
  "refúgio",
] as const;

const LOUVOR_CATEGORY_LABELS: Record<(typeof OFFICIAL_LOUVOR_CATEGORIES)[number], string> = {
  destaques: "Destaques (Top 10)",
  "soldado ferido": "Soldado Ferido",
  ansiedade: "Ansiedade",
  "cura da alma": "Cura da Alma",
  "não desista": "Não Desista",
  refúgio: "Refúgio",
};

export function StudentSidebar() {
  const { logout, isAdmin, adminLoading } = useAuth();
  const { dbModules } = useProjectMode();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: tracksData } = useQuery({
    queryKey: ["tracks-active"],
    queryFn: () => listActiveTracks({ data: {} }),
    staleTime: 60_000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["all-categories"],
    queryFn: () => listCategories({ data: {} }),
    staleTime: 5 * 60_000,
  });

  const allTracks = tracksData?.tracks || [];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("app_language", lng);
  };

  const currentLanguage = i18n.language;

  const normalizeStr = (s: string) =>
    s.replace(/^[^\p{L}\p{N}]+/u, "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const visibleCategories = useMemo(() => {
    const available = new Set<string>();
    for (const t of allTracks as any[]) {
      const rawName = String(t?.category || "").trim();
      const key = normalizeStr(rawName);
      if (OFFICIAL_LOUVOR_CATEGORIES.includes(key as (typeof OFFICIAL_LOUVOR_CATEGORIES)[number])) {
        available.add(key);
      }
    }

    return OFFICIAL_LOUVOR_CATEGORIES.filter((slug) => available.has(slug)).map((slug) => ({
      id: slug,
      name: LOUVOR_CATEGORY_LABELS[slug],
      slug,
    }));
  }, [allTracks]);

  const visibleMenuItems = useMemo(() => {
    if (dbModules.length === 0) return [];

    return dbModules
      .filter((mod) => mod.enabled && mod.visible_in_menu && mod.slug !== "bonus")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((mod) => {
        const meta = SLUG_META[mod.slug];
        if (!meta) return null;
        return {
          key: mod.slug,
          label: t(mod.slug, mod.name), // Use translation with fallback
          icon: meta.icon,
          to: meta.to,
          matchPrefix: meta.matchPrefix || false,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [dbModules, t]);

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (path: string) => 
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navItemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-2xl px-4 py-1.5 text-[15px] font-semibold tracking-tight transition-all duration-400 group/navitem",
      active
        ? "text-gold bg-gold/[0.10] ring-1 ring-gold/15 shadow-[0_0_20px_-4px] shadow-gold/10"
        : "text-foreground/50 hover:text-foreground/80 hover:bg-white/[0.03] ring-1 ring-transparent hover:ring-white/[0.04]"
    );

  const renderMenuItem = (cfg: { key: string; label: string; icon: LucideIcon; to: string; matchPrefix: boolean }) => {
    const Icon = cfg.icon;
    const targetTo = cfg.to;
    const active = cfg.matchPrefix ? isActivePrefix(targetTo) : isActive(targetTo);

    return (
      <Link
        key={cfg.key}
        to={targetTo as any}
        onClick={() => setMobileOpen(false)}
        className={navItemClass(active)}
      >
        <Icon className="h-[22px] w-[22px] shrink-0" />
        {cfg.label}
      </Link>
    );
  };

  const mainItems = visibleMenuItems.filter((cfg) => cfg.key !== "perfil");
  const showPerfil = visibleMenuItems.some((cfg) => cfg.key === "perfil");

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-7 pt-8 pb-6 border-b border-white/[0.06]">
        <LogoBrand size="lg" showSubtitle />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pt-2 pb-2 space-y-0.5">
        {mainItems.map((cfg) => renderMenuItem(cfg))}

        <div className="my-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {showPerfil && (
          <Link
            to="/perfil"
            onClick={() => setMobileOpen(false)}
            className={navItemClass(isActivePrefix("/perfil"))}
          >
            <UserCircle className="h-[22px] w-[22px] shrink-0" />
            Perfil
          </Link>
        )}

        {!adminLoading && isAdmin && (
          <>
            <div className="my-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
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

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[320px] bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      <aside className="hidden md:flex md:flex-col md:w-[310px] md:min-h-screen bg-sidebar border-r border-white/[0.05] shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
