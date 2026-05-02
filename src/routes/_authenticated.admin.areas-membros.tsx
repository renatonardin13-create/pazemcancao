import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Edit, 
  Eye, 
  ExternalLink, 
  Globe, 
  Star,
  Shield,
  User,
  LayoutGrid,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getAreas, deleteArea, duplicateArea, updateArea } from "@/lib/admin-areas.functions";
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

export const Route = createFileRoute("/_authenticated/admin/areas-membros")({
  component: AreasMembrosPage,
});

function AreasMembrosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-areas"],
    queryFn: () => getAreas(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteArea({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
      toast.success("Área excluída com sucesso");
      setAreaToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao excluir área");
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateArea({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
      toast.success("Área duplicada com sucesso");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao duplicar área");
    }
  });

  const togglePrimaryMutation = useMutation({
    mutationFn: ({ id, is_primary }: { id: string, is_primary: boolean }) => 
      updateArea({ data: { id, is_primary } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] });
      toast.success("Área principal atualizada");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar área");
    }
  });

  const areas = data?.areas || [];
  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Áreas de membros</h1>
          <p className="text-muted-foreground mt-1 text-lg">Crie quantas áreas independentes quiser para seus produtos.</p>
        </div>
        <Button 
          onClick={() => navigate({ to: "/admin/areas/new" })}
          className="h-12 px-6 bg-gold hover:bg-gold/90 text-black font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5 mr-2 stroke-[3]" />
          Nova área
        </Button>
      </div>

      {/* Stats and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-border/20">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20 font-bold px-3 py-1">
            {areas.length} áreas criadas
          </Badge>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
          <Input 
            placeholder="Buscar por nome ou slug..." 
            className="pl-10 h-11 bg-card/50 border-border/40 focus-visible:ring-gold rounded-xl transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-card/40 border border-border/20 animate-pulse" />
          ))}
        </div>
      ) : filteredAreas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAreas.map((area) => (
              <motion.div
                key={area.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`group relative overflow-hidden bg-card/40 border-border/30 hover:border-gold/30 transition-all duration-500 rounded-[2rem] hover:shadow-[0_20px_50px_-20px_rgba(212,175,55,0.15)] ${area.is_primary ? 'ring-2 ring-gold/40' : ''}`}>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-gold/5 group-hover:bg-gold/40 transition-colors" />
                  <div className={`absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity ${area.is_primary ? 'opacity-20' : ''}`}>
                    <Globe className="h-24 w-24 text-gold/5 rotate-12" />
                  </div>

                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black tracking-tight group-hover:text-gold transition-colors truncate max-w-[200px]">
                            {area.name}
                          </h3>
                          <div className="flex gap-2">
                            {area.status === 'active' ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                Ativa
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                Rascunho
                              </Badge>
                            )}
                            {area.is_primary && (
                              <Badge className="bg-gold text-black border-gold text-[10px] font-black uppercase tracking-widest shadow-[0_4px_10px_rgba(212,175,55,0.3)]">
                                Principal
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground/60 flex items-center gap-1.5">
                          <Globe className="h-3 w-3" />
                          {area.slug}.suaplataforma.com.br
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gold/10 hover:text-gold transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-card/95 backdrop-blur-xl border-border/30">
                          <DropdownMenuItem 
                            onClick={() => navigate({ to: `/admin/areas/${area.id}/edit` })}
                            className="rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="font-bold">Editar área</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => duplicateMutation.mutate(area.id)}
                            className="rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                            <span className="font-bold">Duplicar</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/20 mx-2" />
                          <DropdownMenuItem 
                            onClick={() => togglePrimaryMutation.mutate({ id: area.id, is_primary: !area.is_primary })}
                            className="rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold transition-colors"
                          >
                            <Star className={`h-4 w-4 ${area.is_primary ? 'fill-gold text-gold' : ''}`} />
                            <span className="font-bold">{area.is_primary ? 'Remover principal' : 'Definir como principal'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/20 mx-2" />
                          <DropdownMenuItem 
                            onClick={() => setAreaToDelete(area.id)}
                            className="rounded-xl flex items-center gap-3 p-3 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="font-bold">Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-background/50 border border-border/20 group-hover:border-gold/20 transition-colors">
                        <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center">
                          <LayoutGrid className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Produto vinculado</p>
                          <p className="text-sm font-bold truncate max-w-[200px]">
                            {area.courses?.title || "Todos os produtos"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="h-12 rounded-xl border-border/40 hover:bg-gold/5 hover:border-gold/30 hover:text-gold font-bold transition-all flex items-center gap-2 group/btn"
                        >
                          <Shield className="h-4 w-4 opacity-60 group-hover/btn:opacity-100" />
                          Ver como Admin
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-12 rounded-xl border-border/40 hover:bg-gold/5 hover:border-gold/30 hover:text-gold font-bold transition-all flex items-center gap-2 group/btn"
                        >
                          <User className="h-4 w-4 opacity-60 group-hover/btn:opacity-100" />
                          Ver como Aluno
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 bg-card/20 rounded-[3rem] border-2 border-dashed border-border/20">
          <div className="h-20 w-20 rounded-[2rem] bg-gold/10 flex items-center justify-center text-gold">
            <Globe className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Nenhuma área encontrada</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchTerm 
                ? `Não encontramos nenhuma área com o termo "${searchTerm}"`
                : "Você ainda não criou nenhuma área de membros. Comece agora mesmo!"
              }
            </p>
          </div>
          <Button 
            onClick={() => navigate({ to: "/admin/areas/new" })}
            className="h-14 px-8 bg-gold hover:bg-gold/90 text-black font-black text-lg rounded-2xl shadow-xl shadow-gold/20"
          >
            <Plus className="h-6 w-6 mr-2 stroke-[3]" />
            Criar minha primeira área
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!areaToDelete} onOpenChange={(open) => !open && setAreaToDelete(null)}>
        <AlertDialogContent className="bg-card border-border/30 rounded-[2rem] p-8 max-w-md">
          <AlertDialogHeader>
            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center">Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg text-muted-foreground">
              Esta ação não pode ser desfeita. A área e todos os seus vínculos serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
            <AlertDialogCancel className="h-14 flex-1 rounded-xl border-border/40 font-bold hover:bg-muted transition-all">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => areaToDelete && deleteMutation.mutate(areaToDelete)}
              className="h-14 flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold transition-all"
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}