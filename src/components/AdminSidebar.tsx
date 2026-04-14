import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, FolderOpen, Settings, Shield, Music, Webhook, BookOpen, Compass, Layout, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
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

const contentItems = [
  { title: "Músicas", url: "/admin/tracks", icon: Music },
  
  { title: "Cursos", url: "/admin/courses", icon: BookOpen },
  { title: "Vitrine", url: "/admin/shelves", icon: Layout },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpen },
  { title: "Trilhas", url: "/admin/journeys", icon: Compass },
];

const toolItems = [
  { title: "Usuários", url: "/admin/users", icon: Users },
  { title: "Vendas", url: "/admin/vendas", icon: DollarSign },
  { title: "Integrações", url: "/admin/integrations", icon: Webhook },
];

const systemItems = [
  { title: "Configurações", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        {/* Brand */}
        <div className={cn("pb-4 mb-2", collapsed ? "px-0 flex justify-center" : "px-4")}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/[0.08] border border-gold/15">
                <Shield className="h-3.5 w-3.5 text-gold/60" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-sidebar-foreground/80 tracking-tight truncate">Admin</p>
                <p className="text-[9px] text-sidebar-foreground/30 truncate">Plataforma de Louvores</p>
              </div>
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/[0.08] border border-gold/15">
              <Shield className="h-3.5 w-3.5 text-gold/60" />
            </div>
          )}
        </div>

        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="Dashboard" className="transition-all duration-300">
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Conteúdo */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.3em] text-sidebar-foreground/25 px-4">
              Conteúdo
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} className="transition-all duration-300">
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

        {/* Ferramentas */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.3em] text-sidebar-foreground/25 px-4">
              Ferramentas
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} className="transition-all duration-300">
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

        {/* Sistema */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.3em] text-sidebar-foreground/25 px-4">
              Sistema
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} className="transition-all duration-300">
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

        {/* Back to app */}
        <SidebarGroup className="mt-auto pb-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Voltar ao app">
                  <Link to="/downloads" className="text-sidebar-foreground/35 hover:text-sidebar-foreground/60">
                    <Settings className="h-4 w-4 shrink-0" />
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
