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
import { cn } from "@/lib/utils";

/** Static lookup: slug → icon, route, prefix-match, submenu flag */
const SLUG_META: Record<string, { icon: LucideIcon; to: string; matchPrefix?: boolean; hasSubmenu?: boolean }> = {
  vitrine:     { icon: Store,          to: "/vitrine" },
  cursos:      { icon: GraduationCap,  to: "/cursos",      matchPrefix: true },
  louvores:    { icon: Music2,         to: "/musicas",     matchPrefix: true, hasSubmenu: true },
  ebooks:      { icon: BookOpen,       to: "/ebooks" },
  trilhas:     { icon: RouteIcon,      to: "/trilhas" },
  // RC4: bônus musical fica DENTRO da categoria em /musicas — sidebar só
  // exibe extras gerais (cursos, ebooks, lançamentos). Mantemos a entrada
  // "bonus" no banco para compatibilidade, mas escondemos do menu lateral.
  lancamentos: { icon: Rocket,         to: "/lancamentos" },
  comunidade:  { icon: Users,          to: "/comunidade" },
  perfil:      { icon: UserCircle,     to: "/perfil" },
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
  const { moduleInfo, isLoading: modulesLoading, dbModules } = useProjectMode();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: tracksData } = useQuery({
    queryKey: ["tracks-active"],
    queryFn: () => listActiveTracks(),
    staleTime: 60_000,
  });

  const allTracks = tracksData?.tracks || [];

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

  // Build the ordered list of visible menu items dynamically from DB modules
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
          label: mod.name,
          icon: meta.icon,
          to: meta.to,
          matchPrefix: meta.matchPrefix || false,
          hasSubmenu: meta.hasSubmenu || false,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [dbModules]);

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (path: string) => location.pathname.startsWith(path);

  const navItemClass = (active: boolean) =>
    cn(
      "flex items-center gap-4 rounded-2xl px-5 py-4 text-[16px] font-semibold tracking-tight transition-all duration-400 group/navitem",
      active
        ? "text-gold bg-gold/[0.10] ring-1 ring-gold/15 shadow-[0_0_20px_-4px] shadow-gold/10"
        : "text-foreground/50 hover:text-foreground/80 hover:bg-white/[0.03] ring-1 ring-transparent hover:ring-white/[0.04]"
    );

  const subItemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-4 py-2.5 ml-8 text-[13.5px] font-medium tracking-tight transition-all duration-400",
      active
        ? "text-gold/90 bg-gold/[0.07] border-l-2 border-gold/40"
        : "text-muted-foreground/45 hover:text-foreground/60 hover:bg-white/[0.03] border-l-2 border-transparent hover:border-white/[0.06]"
    );

  /** Render the Louvores submenu with categories */
  const renderLouvoresSubmenu = () => {
    const currentCategoriaRaw = (location.search as any)?.categoria as string | undefined;
    const currentCategoria = typeof currentCategoriaRaw === "string" ? currentCategoriaRaw.trim().toLowerCase() : "";
    const validCategorySlugs = new Set(visibleCategories.map((cat: any) => String(cat.slug || cat.name).trim().toLowerCase()));
    const hasValidCategory = Boolean(currentCategoria) && validCategorySlugs.has(currentCategoria);
    const isOnMusicas = isActivePrefix("/musicas");
    const isGeneralActive = isOnMusicas && !hasValidCategory;

    return (
      <div>
        <Link
          to="/musicas"
          search={{}}
          onClick={() => setMobileOpen(false)}
          className={cn(navItemClass(isGeneralActive), "w-full")}
        >
          <Music2 className="h-[22px] w-[22px] shrink-0" />
          Louvores
        </Link>

      </div>
    );
  };

  /** Render a standard menu item */
  const renderMenuItem = (cfg: { key: string; label: string; icon: LucideIcon; to: string; matchPrefix: boolean }) => {
    const Icon = cfg.icon;
    const active = cfg.matchPrefix ? isActivePrefix(cfg.to) : isActive(cfg.to);

    return (
      <Link
        key={cfg.key}
        to={cfg.to}
        onClick={() => setMobileOpen(false)}
        className={navItemClass(active)}
      >
        <Icon className="h-[22px] w-[22px] shrink-0" />
        {cfg.label}
      </Link>
    );
  };

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
