import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  Music,
  BookOpen,
  Compass,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Tag,
  Receipt,
  LogOut,
  GraduationCap,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectMode } from "@/hooks/use-project-mode";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Músicas", url: "/admin/musicas", icon: Music },
  { title: "Playlists", url: "/admin/playlists", icon: Compass },
  { title: "Cursos", url: "/admin/cursos", icon: GraduationCap },
  { title: "Vitrine", url: "/admin/vitrine", icon: Sparkles },
  { title: "Categorias", url: "/admin/categorias", icon: Tag },
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Vendas", url: "/admin/vendas", icon: Receipt },
  { title: "Upsells", url: "/admin/upsells", icon: CreditCard },
  { title: "Integrações", url: "/admin/integracoes", icon: Shield },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
];

const systemItems = [
  { title: "Sair", url: "/login", icon: LogOut },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { modules } = useProjectMode();


  const isActive = (path: string) => {
    if (path === "/admin") return currentPath === "/admin";
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  const groupLabelClass =
    "text-[14px] uppercase tracking-[0.15em] text-sidebar-foreground/50 font-semibold px-4 mb-2 mt-4 first:mt-0";

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
                <p className="text-[1.05rem] font-bold text-sidebar-foreground tracking-tight truncate">
                  Admin
                </p>
                <p className="text-[13px] text-sidebar-foreground/40 truncate">
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

        {/* Menu Principal */}
        <SidebarGroup className="py-1">
          {!collapsed && (
            <SidebarGroupLabel className={groupLabelClass}>
              Menu Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={cn(
                      "h-12 transition-all duration-200 text-[1.0625rem] leading-loose",
                      isActive(item.url) && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold"
                    )}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sistema */}
        <SidebarGroup className="py-1 mt-4">
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
                    className={cn(
                      "h-12 transition-all duration-200 text-[1.0625rem] leading-loose",
                      isActive(item.url) && "bg-gold/10 text-gold hover:bg-gold/20 hover:text-gold"
                    )}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.title}</span>
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
                  className="h-12 text-sidebar-foreground/50 hover:text-gold transition-all duration-200 text-[1.0625rem] leading-loose"
                >
                  <Link to="/home">
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Voltar ao app</span>
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