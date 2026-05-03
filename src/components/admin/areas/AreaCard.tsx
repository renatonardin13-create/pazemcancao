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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -12,
        scale: 1.03,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } 
      }}
      className="group relative"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-b from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[28px] blur-xl -z-10" />

      <Card className={`relative overflow-hidden bg-[#111827] border-white/5 transition-all duration-500 rounded-[24px] h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col ${area.principal ? 'ring-2 ring-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.15)]' : 'hover:border-[#D4AF37]/30'}`}>
        {/* Top accent for active area */}
        {area.principal && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-100 z-20" />
        )}

        <CardContent className="p-8 flex-1 flex flex-col">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-[20px] bg-gradient-to-br from-[#1F2937] to-[#111827] flex items-center justify-center text-[#D4AF37] border border-white/5 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Layers className="h-8 w-8 relative z-10" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-2xl font-black text-white group-hover:text-[#D4AF37] transition-colors truncate max-w-[180px] tracking-tight">
                    {area.nome}
                  </h3>
                  {area.principal && (
                    <Badge className="bg-[#D4AF37] text-black border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Principal
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${area.ativa ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`} />
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                     {area.ativa ? 'Online' : 'Offline'}
                   </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); onDuplicate(area.id); }}
                className="h-10 w-10 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); onDelete(area.id); }}
                className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-slate-500 hover:text-destructive transition-all border border-transparent hover:border-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 group-hover:bg-white/[0.04] transition-colors">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Idioma</p>
              <p className="text-xs font-bold text-slate-300">{area.language || 'Português (BR)'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 group-hover:bg-white/[0.04] transition-colors">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
              <p className={`text-xs font-bold ${area.ativa ? 'text-emerald-400' : 'text-slate-400'}`}>
                {area.ativa ? 'Ativo' : 'Rascunho'}
              </p>
            </div>
          </div>

          {/* URL Info Section */}
          <div className="space-y-4 mb-10">
            <div className="p-5 rounded-2xl bg-[#0B1220] border border-white/5 group-hover:border-[#D4AF37]/20 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]/20" />
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-3.5 w-3.5 text-[#D4AF37]/60" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/60">URL DE ACESSO</p>
              </div>
              <p className="text-sm font-bold text-slate-300 truncate font-mono tracking-tight">
                {area.subdominio}.suaplataforma.com
              </p>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="mt-auto space-y-3">
            <Button 
              onClick={() => onEdit(area.id)}
              className="w-full h-14 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black text-sm rounded-2xl shadow-2xl shadow-[#D4AF37]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <Settings className="h-5 w-5" />
              Editar Área
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.open(`https://app.${area.subdominio}.suaplataforma.com/admin-preview`, '_blank')}
                className="h-12 rounded-2xl bg-transparent border-white/10 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-slate-400 hover:text-[#D4AF37] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Shield className="h-4 w-4 opacity-60" />
                <span>Ver Admin</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(`https://app.${area.subdominio}.suaplataforma.com`, '_blank')}
                className="h-12 rounded-2xl bg-transparent border-white/10 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-slate-400 hover:text-[#D4AF37] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4 opacity-60" />
                <span>Ver Aluno</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
