import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { listCategories, listActiveTracks } from "@/lib/tracks.functions";
import { getStudentShelves } from "@/lib/shelves.functions";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { LogoBrand } from "./LogoBrand";
import {
  Store,
  GraduationCap,
  Music2,
  BookOpen,
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

  // Build set of categories that have at least one active track
  // Normalize: strip emoji prefix, lowercase, trim for robust matching
  const normalizeStr = (s: string) =>
    s.replace(/^[^\p{L}\p{N}]+/u, "").trim().toLowerCase();

  const categoriesWithTracks = useMemo(() => {
    const catSet = new Set<string>();
    for (const t of allTracks) {
      if (t.category) {
        catSet.add(t.category.toLowerCase());
        catSet.add(normalizeStr(t.category));
      }
    }
    return catSet;
  }, [allTracks]);

  const visibleCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((cat: any) => {
      const slug = (cat.slug || "").toLowerCase();
      const name = cat.name.toLowerCase();
      const plainName = normalizeStr(cat.name);

      // Match by slug, full name, or plain name (without emoji)
      const hasTrack =
        categoriesWithTracks.has(slug) ||
        categoriesWithTracks.has(name) ||
        categoriesWithTracks.has(plainName);

      if (!hasTrack) return false;

      // Deduplicate by slug first, then by plain name
      const dedupeKey = slug || plainName;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });
  }, [categories, categoriesWithTracks]);

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (path: string) => location.pathname.startsWith(path);

  const navItemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold uppercase tracking-[0.08em] transition-all duration-300",
      active
        ? "text-gold bg-gold/[0.08] border border-gold/15"
        : "text-muted-foreground/45 hover:text-gold/60 hover:bg-muted/10 border border-transparent"
    );

  const subItemClass = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 rounded-lg px-4 py-2.5 ml-4 text-[13px] font-medium transition-all duration-300",
      active
        ? "text-gold/80 bg-gold/[0.06]"
        : "text-muted-foreground/35 hover:text-gold/50 hover:bg-muted/8"
    );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/10">
        <LogoBrand size="md" showSubtitle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {/* Vitrine */}
        {hasVitrine && (
          <Link
            to="/vitrine"
            onClick={() => setMobileOpen(false)}
            className={navItemClass(isActive("/vitrine"))}
          >
            <Store className="h-4 w-4" />
            Vitrine
          </Link>
        )}

        {/* Meus Cursos */}
        {hasCourses && (
          <Link
            to="/cursos"
            onClick={() => setMobileOpen(false)}
            className={navItemClass(isActive("/cursos") || isActivePrefix("/cursos/"))}
          >
            <GraduationCap className="h-4 w-4" />
            Meus Cursos
          </Link>
        )}

        {/* Louvores with subcategories */}
        {hasTracks && (
          <div>
            <button
              onClick={() => setLouvoresOpen(!louvoresOpen)}
              className={cn(
                navItemClass(isActivePrefix("/musicas")),
                "w-full justify-between"
              )}
            >
              <span className="flex items-center gap-3">
                <Music2 className="h-4.5 w-4.5" />
                Louvores
              </span>
              {louvoresOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/30" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
              )}
            </button>

            {louvoresOpen && (
              <div className="mt-1 space-y-0.5">
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

        {/* Perfil */}
        <Link
          to="/perfil"
          onClick={() => setMobileOpen(false)}
          className={navItemClass(isActive("/perfil"))}
        >
          <UserCircle className="h-4 w-4" />
          Perfil
        </Link>

        {/* Admin */}
        {!adminLoading && isAdmin && (
          <>
            <div className="my-3 h-px bg-gradient-to-r from-transparent via-border/15 to-transparent" />
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={navItemClass(isActivePrefix("/admin"))}
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border/10">
        <button
          onClick={() => { logout(); setMobileOpen(false); }}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 w-full text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/30 hover:text-muted-foreground/55 hover:bg-muted/10 transition-all duration-300"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-2xl border-b border-border/10 md:hidden">
        <LogoBrand size="sm" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/40 hover:text-foreground/60 hover:bg-muted/15 transition-colors"
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
          "fixed top-0 left-0 z-50 h-full w-[280px] bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[260px] md:min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
