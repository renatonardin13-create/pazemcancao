import { 
  Copy, 
  Trash2, 
  Star, 
  Layers, 
  ExternalLink, 
  Edit, 
  Shield, 
  User,
  Globe,
  Settings
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
    status?: string | null;
    language?: string | null;
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
  onTogglePrincipal,
  onToggleActive
}: AreaCardProps) {
  const fullUrl = `app.${area.subdominio}.seudominio.com`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        y: -10, 
        transition: { duration: 0.3, ease: "easeOut" } 
      }}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-[#D4AF37]/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10" />

      <Card className={`relative overflow-hidden bg-[#111827] border-white/5 transition-all duration-300 rounded-[20px] h-full shadow-2xl ${area.principal ? 'ring-2 ring-[#D4AF37]/40 shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'hover:border-[#D4AF37]/20'}`}>
        {/* Top accent for active area */}
        {area.principal && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />
        )}

        <CardContent className="p-8">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.1)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Layers className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate max-w-[170px]">
                    {area.nome}
                  </h3>
                  {area.principal && (
                    <div className="h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] animate-pulse" />
                  )}
                </div>
                <p className="text-xs font-medium text-slate-500 tracking-tight">
                  {area.subdominio}.seudominio.com
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDuplicate(area.id)}
                className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white transition-all"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(area.id)}
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive/30 hover:text-destructive transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-2 mb-8">
            {area.ativa ? (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider rounded-md px-2.5 py-0.5">
                Ativa
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-500/5 text-slate-500 border-slate-500/20 text-[10px] font-bold uppercase tracking-wider rounded-md px-2.5 py-0.5">
                Inativa
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-md px-2.5 py-0.5">
              {area.courses?.title?.toLowerCase().includes('desenho') ? 'Desenhos' : area.courses?.title?.toLowerCase().includes('curso') ? 'Cursos' : 'Misto'}
            </Badge>
            <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-md px-2.5 py-0.5">
              {area.language || 'PT-BR'}
            </Badge>
          </div>

          {/* URL Info Section */}
          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-xl bg-[#0B1220] border border-white/5 group-hover:border-[#D4AF37]/10 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe className="h-3 w-3 text-slate-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">URL DA ÁREA</p>
              </div>
              <p className="text-sm font-medium text-slate-300 truncate font-mono">
                {fullUrl}
              </p>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-3">
            <Button 
              onClick={() => onEdit(area.id)}
              className="w-full h-12 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-sm rounded-xl shadow-xl shadow-[#D4AF37]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Settings className="h-5 w-5" />
              Personalizar área
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-11 rounded-xl bg-transparent border-white/10 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-slate-400 hover:text-[#D4AF37] text-xs font-bold transition-all flex items-center gap-2"
              >
                <Shield className="h-3.5 w-3.5 opacity-60" />
                <span>Ver como admin</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-11 rounded-xl bg-transparent border-white/10 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-slate-400 hover:text-[#D4AF37] text-xs font-bold transition-all flex items-center gap-2"
              >
                <User className="h-3.5 w-3.5 opacity-60" />
                <span>Ver como aluno</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
