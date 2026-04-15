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
      "flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] font-semibold tracking-tight transition-all duration-500",
      active
        ? "text-gold bg-gold/[0.08] border border-gold/15 shadow-sm shadow-gold/5"
        : "text-foreground/50 hover:text-foreground/75 hover:bg-muted/8 border border-transparent"
    );

  const subItemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-4 py-2.5 ml-6 text-[13px] font-medium tracking-tight transition-all duration-500",
      active
        ? "text-gold/85 bg-gold/[0.06] border-l-2 border-gold/35"
        : "text-muted-foreground/50 hover:text-foreground/60 hover:bg-muted/6 border-l-2 border-transparent"
    );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo — larger and more prominent */}
      <div className="px-6 py-6 border-b border-border/15">
        <LogoBrand size="lg" showSubtitle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
        {/* Vitrine */}
        {hasVitrine && (
          <Link
            to="/vitrine"
            onClick={() => setMobileOpen(false)}
            className={navItemClass(isActive("/vitrine"))}
          >
            <Store className="h-5 w-5 shrink-0" />
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
            <GraduationCap className="h-5 w-5 shrink-0" />
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
              <span className="flex items-center gap-3.5">
                <Music2 className="h-5 w-5 shrink-0" />
                Louvores
              </span>
              {louvoresOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground/45 transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground/45 transition-transform" />
              )}
            </button>

            {louvoresOpen && (
              <div className="mt-2 space-y-1">
                <Link
                  to="/musicas"
                  search={{}}
                  onClick={() => setMobileOpen(false)}
                  className={subItemClass(
                    isActive("/musicas") && !(location.search as any)?.categoria
                  )}
                >
                  <span className="text-[13px]">⭐</span>
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
                        <span className="text-[13px]">{cat.icon || "🎵"}</span>
                        {cat.name.replace(/^[^\w\s]+\s*/u, "")}
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Separator */}
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-border/25 to-transparent" />

        {/* Perfil */}
        <Link
          to="/perfil"
          onClick={() => setMobileOpen(false)}
          className={navItemClass(isActive("/perfil"))}
        >
          <UserCircle className="h-5 w-5 shrink-0" />
          Perfil
        </Link>

        {/* Admin */}
        {!adminLoading && isAdmin && (
          <>
            <div className="my-3 h-px bg-gradient-to-r from-transparent via-border/25 to-transparent" />
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={navItemClass(isActivePrefix("/admin"))}
            >
              <Settings className="h-5 w-5 shrink-0" />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-4 py-5 border-t border-border/15">
        <button
          onClick={() => { logout(); setMobileOpen(false); }}
          className="flex items-center gap-3.5 rounded-xl px-4 py-3 w-full text-[13px] font-semibold text-muted-foreground/45 hover:text-foreground/65 hover:bg-muted/10 transition-all duration-300"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-2xl border-b border-border/20 md:hidden">
        <LogoBrand size="sm" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/15 transition-colors"
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
          "fixed top-0 left-0 z-50 h-full w-[300px] bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[290px] md:min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
