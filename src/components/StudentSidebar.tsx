import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { listCategories, listActiveTracks } from "@/lib/tracks.functions";
import { getStudentShelves } from "@/lib/shelves.functions";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { useProjectMode } from "@/hooks/use-project-mode";
import { LogoBrand } from "./LogoBrand";
import {
  Store,
  GraduationCap,
  Music2,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export function StudentSidebar() {
  const { logout, isAdmin, adminLoading } = useAuth();
  const { showMusic, showCourses } = useProjectMode();
  const location = useLocation();
  const [louvoresOpen, setLouvoresOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const { data: shelvesData } = useQuery({
    queryKey: ["student-shelves"],
    queryFn: () => getStudentShelves(),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const { data: myCoursesData } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => getMyCoursesData(),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const { data: tracksData } = useQuery({
    queryKey: ["tracks-active"],
    queryFn: () => listActiveTracks(),
    staleTime: 30_000,
  });

  const allTracks = tracksData?.tracks || [];
  const categories = catData?.categories || [];
  const hasVitrine = (shelvesData?.shelves || []).length > 0;
  const hasCourses = (myCoursesData?.courses || []).length > 0;
  const hasTracks = allTracks.length > 0;

  const normalizeStr = (s: string) =>
    s.replace(/^[^\p{L}\p{N}]+/u, "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const categoriesWithTracks = useMemo(() => {
    const catSet = new Set<string>();
    for (const t of allTracks) {
      if (t.category) {
        catSet.add(normalizeStr(t.category));
      }
    }
    return catSet;
  }, [allTracks]);

  const visibleCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((cat: any) => {
      const slug = (cat.slug || "").toLowerCase();
      const normalizedName = normalizeStr(cat.name);
      const normalizedSlug = normalizeStr(slug);

      const hasTrack =
        categoriesWithTracks.has(normalizedSlug) ||
        categoriesWithTracks.has(normalizedName);

      if (!hasTrack) return false;

      const dedupeKey = normalizedName || normalizedSlug;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });
  }, [categories, categoriesWithTracks]);

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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo — prominent with generous spacing */}
      <div className="px-7 pt-8 pb-6 border-b border-white/[0.06]">
        <LogoBrand size="lg" showSubtitle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-5 pt-6 pb-4 space-y-2">
        {/* Vitrine */}
        {hasVitrine && showCourses && (
          <Link
            to="/vitrine"
            onClick={() => setMobileOpen(false)}
            className={navItemClass(isActive("/vitrine"))}
          >
            <Store className="h-[22px] w-[22px] shrink-0" />
            Vitrine
          </Link>
        )}

        {/* Meus Cursos */}
        {hasCourses && showCourses && (
          <Link
            to="/cursos"
            onClick={() => setMobileOpen(false)}
            className={navItemClass(isActive("/cursos") || isActivePrefix("/cursos/"))}
          >
            <GraduationCap className="h-[22px] w-[22px] shrink-0" />
            Meus Cursos
          </Link>
        )}

        {/* Louvores with subcategories */}
        {hasTracks && showMusic && (
          <div>
            <button
              onClick={() => setLouvoresOpen(!louvoresOpen)}
              className={cn(
                navItemClass(isActivePrefix("/musicas")),
                "w-full justify-between"
              )}
            >
              <span className="flex items-center gap-4">
                <Music2 className="h-[22px] w-[22px] shrink-0" />
                Louvores
              </span>
              {louvoresOpen ? (
                <ChevronDown className="h-4.5 w-4.5 text-muted-foreground/40 transition-transform duration-300" />
              ) : (
                <ChevronRight className="h-4.5 w-4.5 text-muted-foreground/40 transition-transform duration-300" />
              )}
            </button>

            {louvoresOpen && (
              <div className="mt-2.5 space-y-1.5">
                <Link
                  to="/musicas"
                  search={{}}
                  onClick={() => setMobileOpen(false)}
                  className={subItemClass(
                    isActive("/musicas") && !(location.search as any)?.categoria
                  )}
                >
                  <span className="text-sm">⭐</span>
                  Destaques (Top 10)
                </Link>
                {visibleCategories
                  .filter((cat: any) => {
                    const slug = (cat.slug || cat.name.toLowerCase()).toLowerCase();
                    const plainName = cat.name.toLowerCase().replace(/^[^\p{L}\p{N}]+/u, "").trim();
                    return slug !== "destaques" && slug !== "top-10-mais-fortes"
                      && !plainName.startsWith("destaques");
                  })
                  .map((cat: any) => {
                    const catSlug = cat.slug || cat.name.toLowerCase();
                    const isActiveCat = (location.search as any)?.categoria === catSlug;
                    return (
                      <Link
                        key={cat.id}
                        to="/musicas"
                        search={{ categoria: catSlug }}
                        onClick={() => setMobileOpen(false)}
                        className={subItemClass(isActiveCat)}
                      >
                        <span className="text-sm">{cat.icon || "🎵"}</span>
                        {cat.name.replace(/^[^\w\s]+\s*/u, "")}
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Separator */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Perfil */}
        <Link
          to="/perfil"
          onClick={() => setMobileOpen(false)}
          className={navItemClass(isActive("/perfil"))}
        >
          <UserCircle className="h-[22px] w-[22px] shrink-0" />
          Perfil
        </Link>

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

      {/* Logout — bottom */}
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
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-2xl border-b border-white/[0.06] md:hidden">
        <LogoBrand size="sm" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-colors"
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
