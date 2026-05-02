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

  const areas = data?.areas || [];

  return (
    <div className="min-h-screen bg-[#07090E] text-white -m-3 sm:-m-6 md:-m-8 p-6 md:p-10 space-y-10">
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

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-gold/10">
              FASE 2
            </span>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
              Áreas de membros
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
              Crie quantas áreas independentes quiser, cada uma com seu próprio catálogo, branding e regras de acesso.
            </p>
          </div>
          
          <Button 
            onClick={() => setIsNewModalOpen(true)}
            className="h-12 px-6 bg-gold hover:bg-gold/90 text-black font-black text-base rounded-xl shadow-2xl shadow-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-6 w-6 mr-2 stroke-[3]" />
            Nova área
          </Button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-gold" />
          </div>
          <span className="text-base font-bold text-white/90">
            📦 {areas.length} áreas criadas
          </span>
        </div>
        <span className="text-sm font-medium text-muted-foreground/60 hidden sm:block">
          Sem limite — crie quantas precisar.
        </span>
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
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center space-y-8 bg-white/[0.01] rounded-[3.5rem] border-2 border-dashed border-white/5 backdrop-blur-sm">
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
            className="h-16 px-10 bg-gold hover:bg-gold/90 text-black font-black text-xl rounded-2xl shadow-2xl shadow-gold/20 transition-all hover:scale-105"
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
