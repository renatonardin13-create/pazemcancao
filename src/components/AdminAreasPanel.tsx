import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { getAreas, createArea, updateArea, deleteArea, type Area } from "@/lib/areas.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Globe, 
  Palette, 
  Type, 
  Eye, 
  Shield, 
  ExternalLink, 
  Layout, 
  MoreVertical,
  Link2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminAreasPanel() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    primary_color: "#D4A853",
    domain: "",
  });

  const { data: areas, isLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área criada com sucesso!");
      handleCloseDialog();
    },
    onError: (error: any) => toast.error(`Erro ao criar área: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateArea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área atualizada com sucesso!");
      handleCloseDialog();
    },
    onError: (error: any) => toast.error(`Erro ao atualizar área: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área excluída com sucesso!");
    },
    onError: (error: any) => toast.error(`Erro ao excluir área: ${error.message}`),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      primary_color: "#D4A853",
      domain: "",
    });
  };

  const handleOpenCreate = () => {
    setEditingArea(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      slug: area.slug,
      description: area.description || "",
      primary_color: area.primary_color || "#D4A853",
      domain: area.domain || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingArea(null);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArea) {
      updateMutation.mutate({ id: editingArea.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta área? Todos os dados vinculados serão afetados.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewAsAdmin = (area: Area) => {
    // Navigate to admin view of the area
    window.open(`/${area.slug}/admin`, "_blank");
  };

  const handleViewAsUser = (area: Area) => {
    // Navigate to user view of the area
    window.open(`/${area.slug}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando áreas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground">Gestão de Áreas</h2>
          <p className="text-muted-foreground/60 max-w-lg">
            Controle os diferentes ecossistemas da sua plataforma, configure domínios e personalize a experiência de cada ambiente.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="bg-gold hover:bg-gold/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-gold/10 transition-all active:scale-95 gap-2"
        >
          <Plus className="h-5 w-5" /> Nova Área
        </Button>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas?.map((area) => (
          <Card 
            key={area.id} 
            className="group relative overflow-hidden bg-card/40 border-border/20 hover:border-gold/30 hover:bg-card/60 transition-all duration-500 shadow-xl shadow-black/5"
          >
            {/* Background Glow */}
            <div 
              className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{ backgroundColor: area.primary_color || "#D4A853" }}
            />
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-start justify-between">
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500" 
                  style={{ backgroundColor: area.primary_color || "#D4A853" }}
                >
                  <Layout className="h-6 w-6" />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground hover:bg-white/5">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border/40 p-1.5 rounded-xl shadow-2xl">
                    <DropdownMenuItem 
                      onClick={() => handleOpenEdit(area)}
                      className="gap-2 focus:bg-gold/10 focus:text-gold cursor-pointer rounded-lg py-2"
                    >
                      <Edit2 className="h-4 w-4" /> Editar Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/20" />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(area.id)}
                      className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg py-2"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir Área
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-4 space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight group-hover:text-gold transition-colors duration-300">
                  {area.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground/70 min-h-[40px]">
                  {area.description || "Nenhuma descrição informada para esta área da plataforma."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pb-6 space-y-5 relative z-10">
              {/* Meta Info */}
              <div className="space-y-2.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground/50 font-medium uppercase tracking-wider">Identificador (Slug)</span>
                  <span className="font-mono text-gold/80 bg-gold/5 px-2 py-0.5 rounded-md border border-gold/10">
                    /{area.slug}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground/50 font-medium uppercase tracking-wider">Domínio</span>
                  <span className="font-medium text-foreground/80 truncate max-w-[140px]">
                    {area.domain || "Subdomínio padrão"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewAsAdmin(area)}
                  className="h-10 rounded-xl border-border/30 hover:border-gold/30 hover:bg-gold/5 hover:text-gold transition-all gap-2 text-xs font-bold"
                >
                  <Shield className="h-3.5 w-3.5" /> Ver como Admin
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewAsUser(area)}
                  className="h-10 rounded-xl border-border/30 hover:border-white/20 hover:bg-white/5 transition-all gap-2 text-xs font-bold"
                >
                  <Eye className="h-3.5 w-3.5" /> Ver como Aluno
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {areas?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border/10 rounded-[2rem] bg-card/20 group">
          <div className="h-20 w-20 rounded-3xl bg-gold/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-500">
            <Globe className="h-10 w-10 text-gold/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground/80 mb-2">Nenhuma área encontrada</h3>
          <p className="text-muted-foreground/50 text-center max-w-sm mb-8 font-light">
            Sua plataforma ainda não possui áreas configuradas. Comece criando seu primeiro ecossistema agora.
          </p>
          <Button onClick={handleOpenCreate} className="gap-2 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 px-8 h-12 rounded-xl transition-all">
            <Plus className="h-5 w-5" /> Criar Primeira Área
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border/40 shadow-2xl rounded-[2rem]">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="pt-4 pb-2">
              <DialogTitle className="text-2xl font-black">
                {editingArea ? "Editar Configurações" : "Criar Nova Área"}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes fundamentais para esta área da sua plataforma.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    Nome da Área
                  </Label>
                  <div className="relative group">
                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-gold transition-colors" />
                    <Input
                      id="name"
                      placeholder="Ex: Alunos, VIP, Mentoria"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-11 h-12 bg-black/20 border-border/30 focus:border-gold/50 rounded-xl transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    URL (Slug)
                  </Label>
                  <div className="relative group">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-gold transition-colors" />
                    <Input
                      id="slug"
                      placeholder="ex-alunos"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="pl-11 h-12 bg-black/20 border-border/30 focus:border-gold/50 rounded-xl transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="domain" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    Domínio Próprio (Opcional)
                  </Label>
                  <div className="relative group">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-gold transition-colors" />
                    <Input
                      id="domain"
                      placeholder="alunos.meusite.com.br"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="pl-11 h-12 bg-black/20 border-border/30 focus:border-gold/50 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="primary_color" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    Cor de Identidade
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative group flex-1">
                      <Palette className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-gold transition-colors" />
                      <Input
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="pl-11 h-12 bg-black/20 border-border/30 focus:border-gold/50 rounded-xl transition-all font-mono"
                      />
                    </div>
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="h-12 w-14 rounded-xl border border-border/30 bg-black/20 cursor-pointer p-1 transition-all hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                  Descrição do Ecossistema
                </Label>
                <Textarea
                  id="description"
                  placeholder="Explique brevemente quem tem acesso a esta área e qual o conteúdo principal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="bg-black/20 border-border/30 focus:border-gold/50 rounded-xl resize-none transition-all p-4"
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-end gap-3 pb-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseDialog}
                className="hover:bg-white/5 rounded-xl h-11 px-6 font-medium"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gold hover:bg-gold/90 text-black font-bold h-11 px-8 rounded-xl shadow-lg shadow-gold/10 transition-all active:scale-95"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingArea ? "Salvar Alterações" : "Criar Área"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}