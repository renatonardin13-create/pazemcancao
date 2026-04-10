import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, FolderOpen, Settings, Shield, Music, Webhook } from "lucide-react";
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

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Músicas", url: "/admin/tracks", icon: Music },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpen },
  { title: "Usuários", url: "/admin/users", icon: Users },
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
        <div className="px-4 pb-4 mb-2">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.08] border border-gold/15">
                <Shield className="h-3.5 w-3.5 text-gold/60" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-sidebar-foreground/80 tracking-tight">Admin</p>
                <p className="text-[9px] text-sidebar-foreground/30">Plataforma de Louvores</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <Shield className="h-4 w-4 text-gold/50" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.3em] text-sidebar-foreground/25 px-4">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="transition-all duration-300"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
                <SidebarMenuButton asChild>
                  <Link to="/downloads" className="text-sidebar-foreground/35 hover:text-sidebar-foreground/60">
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Voltar ao app</span>}
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
