import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAreas, createArea, updateArea, deleteArea, type Area } from "@/lib/areas.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Save, X, Globe, Palette, Type } from "lucide-react";

export function AdminAreasPanel() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    mutationFn: createArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área criada com sucesso!");
      setIsAdding(false);
      resetForm();
    },
    onError: (error: any) => toast.error(`Erro ao criar área: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateArea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área atualizada com sucesso!");
      setEditingId(null);
      resetForm();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (area: Area) => {
    setEditingId(area.id);
    setFormData({
      name: area.name,
      slug: area.slug,
      description: area.description || "",
      primary_color: area.primary_color || "#D4A853",
      domain: area.domain || "",
    });
    setIsAdding(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Áreas da Plataforma</h2>
          <p className="text-muted-foreground">Gerencie as diferentes áreas e subdomínios da sua plataforma.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Nova Área
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="bg-card border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle>{editingId ? "Editar Área" : "Nova Área"}</CardTitle>
            <CardDescription>Preencha os dados abaixo para configurar a área.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Área</Label>
                  <div className="relative">
                    <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Ex: Alunos, Mentoria, etc"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="slug"
                      placeholder="ex-alunos"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domínio Personalizado (Opcional)</Label>
                  <Input
                    id="domain"
                    placeholder="alunos.meusite.com.br"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Palette className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="h-10 w-10 rounded border border-border bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o propósito desta área..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4 mr-2" /> Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingId ? "Salvar Alterações" : "Criar Área"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas?.map((area) => (
          <Card key={area.id} className="bg-card/50 border-border/20 hover:border-gold/30 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: area.primary_color || "#D4A853" }}>
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(area)} className="h-8 w-8 text-muted-foreground hover:text-gold">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja excluir esta área?")) {
                        deleteMutation.mutate(area.id);
                      }
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-3 text-lg">{area.name}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[40px]">{area.description || "Sem descrição"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug:</span>
                  <span className="font-medium">/{area.slug}</span>
                </div>
                {area.domain && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Domínio:</span>
                    <span className="font-medium truncate max-w-[150px]">{area.domain}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cor:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: area.primary_color || "#D4A853" }} />
                    <span className="font-mono text-xs uppercase">{area.primary_color}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {areas?.length === 0 && !isAdding && (
        <div className="text-center py-20 border-2 border-dashed border-border/20 rounded-2xl">
          <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Nenhuma área encontrada</h3>
          <p className="text-sm text-muted-foreground/60 mb-6">Comece criando a primeira área da sua plataforma.</p>
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Criar Primeira Área
          </Button>
        </div>
      )}
    </div>
  );
}
