import { 
  Copy, 
  Trash2, 
  Star, 
  Layers, 
  ExternalLink, 
  Edit, 
  Shield, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AreaCardProps {
  area: {
    id: string;
    nome: string;
    subdominio: string;
    ativa: boolean;
    principal: boolean;
    produto_id: string;
    courses?: { title: string };
  };
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (id: string) => void;
  onTogglePrincipal: (id: string, current: boolean) => void;
  onToggleActive: (id: string, current: boolean) => void;
}

export function AreaCard({ 
  area, 
  onDelete, 
  onDuplicate, 
  onEdit, 
  onTogglePrincipal 
}: AreaCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={`relative overflow-hidden bg-[#0F1219] border-white/5 transition-all duration-500 rounded-3xl h-full ${area.principal ? 'ring-2 ring-gold/50 shadow-[0_20px_50px_-20px_rgba(245,196,81,0.2)]' : 'hover:border-gold/30 hover:shadow-[0_20px_40px_-15px_rgba(245,196,81,0.1)]'}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-500">
                <Layers className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white group-hover:text-gold transition-colors truncate max-w-[180px]">
                    {area.nome}
                  </h3>
                  {area.principal && <Star className="h-4 w-4 fill-gold text-gold" />}
                </div>
                <p className="text-xs font-medium text-muted-foreground/60 flex items-center gap-1">
                  app.plataforma.com
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {area.ativa ? (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-full px-3">
                  Ativa
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest opacity-60 rounded-full px-3">
                  Inativa
                </Badge>
              )}
              {area.principal && (
                <Badge className="bg-gold text-black border-gold text-[10px] font-black uppercase tracking-widest shadow-[0_4px_10px_rgba(245,196,81,0.3)] rounded-full px-3">
                  Principal
                </Badge>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-4 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">URL DE ACESSO</p>
              <p className="text-sm font-medium text-white/90 truncate">
                {area.subdominio}.plataforma.com
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-white/5 mb-6" />

          {/* Actions Header */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {area.principal ? "Variação ativa no painel" : "Disponível para ativação"}
            </p>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDuplicate(area.id)}
                className="h-9 w-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(area.id)}
                className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Action */}
          <div className="space-y-4">
            <Button 
              onClick={() => onEdit(area.id)}
              className="w-full h-12 bg-gold hover:bg-gold/90 text-black font-black text-sm rounded-xl shadow-xl shadow-gold/10 group-hover:shadow-gold/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Edit className="h-5 w-5" />
              Personalizar área
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-10 rounded-xl bg-[#151921] border-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-2"
              >
                <Shield className="h-3.5 w-3.5 text-gold/60" />
                <span className="text-[11px]">Ver como admin</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-10 rounded-xl bg-transparent border-gold/30 hover:bg-gold/5 text-gold font-bold transition-all flex items-center gap-2"
              >
                <User className="h-3.5 w-3.5" />
                <span className="text-[11px]">Ver como aluno</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
