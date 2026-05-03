import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  ArrowLeft,
  LayoutGrid,
  Globe,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAreasMembros, deleteAreaMembro, duplicateAreaMembro, updateAreaMembro } from "@/lib/areas-membros.functions";
import { toast } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AreaCard } from "@/components/admin/areas/AreaCard";
import { NewAreaModal } from "@/components/admin/areas/NewAreaModal";

export const Route = createFileRoute("/_authenticated/admin/areas-membros")({
  component: AreasMembrosPage,
});

function AreasMembrosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["areas-membros"],
    queryFn: () => getAreasMembros(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAreaMembro({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas-membros"] });
      toast.success("Área excluída com sucesso");
      setAreaToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao excluir área");
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateAreaMembro({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas-membros"] });
      toast.success("Área duplicada com sucesso");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao duplicar área");
    }
  });

  const togglePrimaryMutation = useMutation({
    mutationFn: ({ id, principal }: { id: string, principal: boolean }) => 
      updateAreaMembro({ data: { id, principal } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas-membros"] });
      toast.success("Área principal atualizada");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar área");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, ativa }: { id: string, ativa: boolean }) => 
      updateAreaMembro({ data: { id, ativa } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas-membros"] });
      queryClient.invalidateQueries({ queryKey: ["admin-areas-list"] });
      toast.success("Status da área atualizado");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar status");
    }
  });

  const areas = data?.areas || [];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white -m-3 sm:-m-6 md:-m-8 p-6 md:p-10 space-y-10">
      {/* Top Navigation */}
      <div className="flex flex-col gap-8">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="w-fit -ml-4 hover:bg-white/5 text-muted-foreground hover:text-white font-bold transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
                MULTI-ÁREAS
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                FASE 2 ATIVA
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
              Áreas de membros
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
              Crie ambientes independentes com catálogo, branding e regras de acesso personalizadas.
            </p>
          </div>
          
          <Button 
            onClick={() => setIsNewModalOpen(true)}
            className="h-14 px-8 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black text-base rounded-2xl shadow-2xl shadow-[#D4AF37]/20 transition-all hover:scale-[1.03] active:scale-[0.97] group"
          >
            <Plus className="h-6 w-6 mr-3 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
            Nova área de membros
          </Button>
        </div>
      </div>

      {/* Info Stats Bar */}
      <div className="flex items-center justify-between p-6 bg-[#111827]/50 border border-white/5 rounded-[24px] backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10 shadow-inner">
            <LayoutGrid className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-xs font-black text-[#D4AF37] uppercase tracking-widest mb-0.5">Visão Geral</p>
            <p className="text-lg font-black text-white">
              {areas.length} Áreas Configuradas
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Sem limite de criação
          </span>
        </div>
      </div>

      {/* Grid Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[360px] rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : areas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {areas.map((area) => (
              <AreaCard 
                key={area.id}
                area={{
                  ...area,
                  ativa: area.ativa ?? false,
                  principal: area.principal ?? false,
                  produto_id: area.produto_id ?? "",
                  courses: area.courses ? { title: area.courses.title } : undefined
                }}
                onDelete={(id) => setAreaToDelete(id)}
                onDuplicate={(id) => duplicateMutation.mutate(id)}
                onEdit={(id) => navigate({ to: `/admin/areas/${id}/edit` })}
                onTogglePrincipal={(id, current) => togglePrimaryMutation.mutate({ id, principal: !current })}
                onToggleActive={(id, current) => toggleActiveMutation.mutate({ id, ativa: !current })}

              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-8 bg-white/[0.01] rounded-3xl border-2 border-dashed border-white/5 backdrop-blur-sm">
          <div className="h-24 w-24 rounded-[2.5rem] bg-gold/10 flex items-center justify-center text-gold">
            <Globe className="h-12 w-12" />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-black">Nenhuma área encontrada</h3>
            <p className="text-muted-foreground text-lg max-w-sm mx-auto font-medium">
              Você ainda não criou nenhuma área de membros. Comece agora mesmo e expanda sua operação.
            </p>
          </div>
          <Button 
            onClick={() => setIsNewModalOpen(true)}
            className="h-14 px-8 bg-gold hover:bg-gold/90 text-black font-black text-lg rounded-xl shadow-2xl shadow-gold/20 transition-all hover:scale-105"
          >
            <Plus className="h-7 w-7 mr-3 stroke-[3]" />
            Criar minha primeira área
          </Button>
        </div>
      )}

      {/* Modals */}
      <NewAreaModal 
        open={isNewModalOpen} 
        onOpenChange={setIsNewModalOpen} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!areaToDelete} onOpenChange={(open) => !open && setAreaToDelete(null)}>
        <AlertDialogContent className="bg-[#0A0D14] border-white/5 rounded-[2.5rem] p-10 max-w-md shadow-2xl">
          <AlertDialogHeader>
            <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black text-center text-white">Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg text-muted-foreground font-medium">
              Esta ação não pode ser desfeita. A área e todos os seus vínculos serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-4 mt-10">
            <AlertDialogCancel className="h-14 flex-1 rounded-2xl border-white/10 bg-transparent text-white font-bold hover:bg-white/5 transition-all">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => areaToDelete && deleteMutation.mutate(areaToDelete)}
              className="h-14 flex-1 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-bold shadow-xl shadow-destructive/20 transition-all"
            >
              Excluir agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
