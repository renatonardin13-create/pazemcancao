import { useAdminActiveArea } from "@/hooks/use-admin-active-area";
import { 
  ChevronDown, 
  Globe, 
  Check, 
  Settings2 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

export function AreaSelector() {
  const { activeArea, areas, isLoading, setArea } = useAdminActiveArea();
  const queryClient = useQueryClient();

  if (isLoading || !activeArea) return null;

  const handleAreaChange = (id: string) => {
    setArea(id);
    // Invalidate main admin queries to refresh the data for the new area
    queryClient.invalidateQueries({ queryKey: ["admin-shelves"] });
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gold/5 border border-gold/15 hover:bg-gold/10 hover:border-gold/30 transition-all duration-300 group outline-none">
          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold/50 font-black mb-0.5 group-hover:text-gold/70 transition-colors">
              Variação Ativa
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-foreground/90 truncate max-w-[140px]">
                {activeArea.nome}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gold/60 group-hover:text-gold transition-colors" />
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] bg-card/95 backdrop-blur-xl border-border/40 p-1.5 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          Minhas Áreas
        </DropdownMenuLabel>
        <div className="space-y-0.5">
          {areas?.filter(a => a.ativa).map((area) => (
            <DropdownMenuItem
              key={area.id}
              onClick={() => handleAreaChange(area.id)}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                activeArea.id === area.id 
                  ? "bg-gold/10 text-gold" 
                  : "hover:bg-white/5 text-muted-foreground/80 hover:text-foreground"
              )}
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">{area.nome}</span>
                <span className="text-[10px] font-medium opacity-50 font-mono tracking-wider">{area.subdominio}.suaplataforma.com.br</span>
              </div>
              {activeArea.id === area.id && (
                <Check className="h-4 w-4 shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator className="my-1.5 bg-border/20" />
        
        <DropdownMenuItem asChild className="focus:bg-gold/10 focus:text-gold p-0">
          <Link 
            to="/admin/areas-membros" 
            className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-xs font-bold text-muted-foreground/60 transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Gerenciar áreas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
