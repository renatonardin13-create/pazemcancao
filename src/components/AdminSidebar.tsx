import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Settings,
  Shield,
  Music,
  Webhook,
  BookOpen,
  Compass,
  Layout,
  DollarSign,
  ArrowLeft,
  Sparkles,
  Disc3,
  Eye,
  GalleryHorizontalEnd,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectMode } from "@/hooks/use-project-mode";
import { useArea } from "@/providers/AreaProvider";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const allContentItems = [
  { title: "Músicas", url: "/admin/tracks", icon: Music, module: "louvores" as const },
  { title: "Playlists", url: "/admin/playlists", icon: Disc3, module: "louvores" as const },
  { title: "Cursos", url: "/admin/courses", icon: BookOpen, module: "cursos" as const },
  { title: "Vitrine", url: "/admin/shelves", icon: Layout, module: "vitrine" as const },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpen, module: "louvores" as const },
  { title: "Trilhas", url: "/admin/journeys", icon: Compass, module: "trilhas" as const },
];

const toolItems = [
  { title: "Usuários", url: "/admin/users", icon: Users },
  { title: "Vendas", url: "/admin/vendas", icon: DollarSign },
  { title: "Upsells", url: "/admin/upsells", icon: Sparkles },
  { title: "Integrações", url: "/admin/integrations", icon: Webhook },
  { title: "Impersonar aluno", url: "/admin/impersonar", icon: Eye },
];

const systemItems = [
  { title: "Configurações", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { modules } = useProjectMode();
  const { currentArea, areas, switchArea, isLoading: areasLoading } = useArea();

  const contentItems = useMemo(
    () => allContentItems.filter((item) => modules[item.module]),
    [modules]
  );

  const isActive = (path: string) =>
    path === "/admin"
      ? currentPath === "/admin"
      : currentPath.startsWith(path);

  const groupLabelClass =
    "text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/30 font-bold px-4 mb-1";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-5 pb-4 flex flex-col h-full">
        {/* Brand */}
        <div
          className={cn(
            "pb-5 mb-1 border-b border-sidebar-border/50",
            collapsed ? "px-0 flex justify-center" : "px-5"
          )}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20 shadow-sm shadow-gold/5">
                <Shield className="h-4 w-4 text-gold" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-sidebar-foreground tracking-tight truncate">
                  Admin
                </p>
                <p className="text-[11px] text-sidebar-foreground/40 truncate">
                  Painel de Gestão
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20 shadow-sm shadow-gold/5">
              <Shield className="h-4 w-4 text-gold" />
            </div>
          )}
        </div>
        
        {/* Area Selector */}
        {!collapsed && areas.length > 0 && (
          <div className="px-4 py-3">
            <p className={groupLabelClass}>Ambiente Selecionado</p>
            <div className="relative mt-1 group">
              <select
                value={currentArea?.id || ""}
                onChange={(e) => switchArea(e.target.value)}
                className="w-full appearance-none rounded-xl border border-sidebar-border/50 bg-sidebar-accent/30 py-2 pl-3 pr-8 text-xs font-semibold text-sidebar-foreground/80 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all cursor-pointer hover:bg-sidebar-accent/50"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/30 group-hover:text-gold/50 transition-colors" />
            </div>
          </div>
        )}

        {/* Dashboard */}
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin")}
                  tooltip="Dashboard"
                  className="h-10 transition-all duration-200"
                >
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span className="font-semibold">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className="mx-4 h-px bg-sidebar-border/40 my-1" />

        {/* Conteúdo */}
        <SidebarGroup className="py-1">
          {!collapsed && (
            <SidebarGroupLabel className={groupLabelClass}>
              Conteúdo
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-10 transition-all duration-200"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className="mx-4 h-px bg-sidebar-border/40 my-1" />

        {/* Ferramentas */}
        <SidebarGroup className="py-1">
          {!collapsed && (
            <SidebarGroupLabel className={groupLabelClass}>
              Ferramentas
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-10 transition-all duration-200"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className="mx-4 h-px bg-sidebar-border/40 my-1" />

        {/* Sistema */}
        <SidebarGroup className="py-1">
          {!collapsed && (
            <SidebarGroupLabel className={groupLabelClass}>
              Sistema
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-10 transition-all duration-200"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Back to app — pushed to bottom */}
        <SidebarGroup className="mt-auto pt-2 border-t border-sidebar-border/40">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Voltar ao app"
                  className="h-10 text-sidebar-foreground/50 hover:text-gold transition-all duration-200"
                >
                  <Link to="/vitrine">
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span>Voltar ao app</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
