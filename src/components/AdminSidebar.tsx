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
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Usuários", url: "/admin/users", icon: Users },
];

const contentGroups = [
  { title: "Louvores", url: "/admin/tracks", icon: Music, module: "louvores" as const },
  { title: "Cursos", url: "/admin/courses", icon: GraduationCap, module: "cursos" as const },
  { title: "Trilhas", url: "/admin/journeys", icon: Compass, module: "trilhas" as const },
  { title: "Ebooks", url: "/admin/conteudos", icon: BookOpen, module: "ebooks" as const },
  { title: "Lançamentos", url: "/admin/hero-banners", icon: Sparkles, module: "lancamentos" as const },
  { title: "Comunidade", url: "/comunidade", icon: Users, module: "comunidade" as const },
];

const salesItems = [
  { title: "Transações", url: "/admin/transactions", icon: Receipt },
  { title: "Vendas", url: "/admin/vendas", icon: CreditCard },
  { title: "Cupons", url: "/admin/coupons", icon: Tag },
];

const systemItems = [
  { title: "Webhooks", url: "/admin/integrations", icon: Shield },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
  { title: "Sair", url: "/login", icon: LogOut },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { modules } = useProjectMode();


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

        {/* Gestão */}
        <SidebarGroup className="py-1">
          {!collapsed && (
            <SidebarGroupLabel className={groupLabelClass}>
              Gestão
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
                    className="h-10 transition-all duration-200"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Conteúdo */}
        <SidebarGroup className="py-1">
          {!collapsed && (
            <SidebarGroupLabel className={groupLabelClass}>
              Conteúdo
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {contentGroups
                .filter((item) => !item.module || modules[item.module])
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url || "")}
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

        {/* Financeiro */}
        <SidebarGroup className="py-1">
          {!collapsed && (
            <SidebarGroupLabel className={groupLabelClass}>
              Financeiro
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {salesItems.map((item) => (
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