import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/admin-categories.functions";
import { FolderOpen, Plus, Trash2, Pencil, GripVertical, Check, X, Tag } from "lucide-react";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategoriesPage,
});

const PICKER_COLORS = [
  "#C8A951", "#3B82F6", "#EC4899", "#22C55E", "#F97316",
  "#A855F7", "#06B6D4", "#F43F5E", "#14B8A6", "#F59E0B",
  "#10B981",
];

function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editValues, setEditValues] = useState({ name: "", slug: "", description: "", icon: "", color: "" });
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "", icon: "", color: PICKER_COLORS[0] });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; slug: string; description?: string; icon?: string; color?: string }) =>
      createCategory({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria criada");
      setShowForm(false);
      setNewCat({ name: "", slug: "", description: "", icon: "", color: PICKER_COLORS[0] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; slug?: string; description?: string; icon?: string; color?: string }) =>
      updateCategory({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria atualizada");
      setEditingCat(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria removida");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderCategories({ data: { orderedIds } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
    onError: (err: any) => toast.error(err.message),
  });

  const categories = data?.categories || [];

  const handleNameChange = (value: string, target: "new" | "edit") => {
    const slug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (target === "new") {
      setNewCat((prev) => ({ ...prev, name: value, slug }));
    } else {
      setEditValues((prev) => ({ ...prev, name: value, slug }));
    }
  };

  const startEdit = (cat: any) => {
    setEditingCat(cat);
    setEditValues({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "",
      color: cat.color || PICKER_COLORS[0],
    });
  };

  const moveCategory = useCallback(
    (index: number, direction: "up" | "down") => {
      const newOrder = [...categories];
      const swapIdx = direction === "up" ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= newOrder.length) return;
      [newOrder[index], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[index]];
      reorderMutation.mutate(newOrder.map((c: any) => c.id));
    },
    [categories, reorderMutation]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground/90 tracking-tight">
          Categorias e Tags
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground/45">
          Organize seus cursos com categorias e tags personalizadas
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Categories Panel */}
        <div className="rounded-2xl border border-border/15 bg-card/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-foreground/85 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-gold/60" />
              Categorias
            </h2>
            <Button
              onClick={() => { setShowForm(true); setNewCat({ name: "", slug: "", description: "", icon: "" }); }}
              className="gap-1.5 h-9 bg-gold/90 text-gold-foreground hover:bg-gold font-semibold text-[12px]"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Categoria
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
                Carregando...
              </p>
            </div>
          ) : !categories.length ? (
            <div className="text-center py-12">
              <FolderOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/35">Nenhuma categoria cadastrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat: any, index: number) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-xl border border-border/10 bg-card/8 px-4 py-3 hover:bg-card/15 transition-colors group"
                >
                  {/* Drag handle */}
                  <GripVertical className="h-4 w-4 text-muted-foreground/15 shrink-0 cursor-grab" />

                  {/* Color dot */}
                  <div className={`h-3 w-3 rounded-full shrink-0 ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/85 truncate">{cat.name}</p>
                    {cat.description && (
                      <p className="text-[11px] text-muted-foreground/40 truncate">{cat.description}</p>
                    )}
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-muted-foreground/30 hover:text-gold/60 transition-colors rounded-lg hover:bg-muted/10"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Remover esta categoria?")) deleteMutation.mutate(cat.id);
                      }}
                      className="p-1.5 text-muted-foreground/30 hover:text-destructive/60 transition-colors rounded-lg hover:bg-muted/10"
                      title="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags Panel */}
        <div className="rounded-2xl border border-border/15 bg-card/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-foreground/85 flex items-center gap-2">
              <Tag className="h-4 w-4 text-gold/60" />
              Tags
            </h2>
            <Button
              className="gap-1.5 h-9 bg-gold/90 text-gold-foreground hover:bg-gold font-semibold text-[12px]"
              size="sm"
              disabled
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Tag
            </Button>
          </div>

          <div className="text-center py-12">
            <Tag className="h-8 w-8 text-muted-foreground/15 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/35">Nenhuma tag cadastrada</p>
          </div>
        </div>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Categoria</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCat.name || !newCat.slug) { toast.error("Nome e slug são obrigatórios"); return; }
              createMutation.mutate(newCat);
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newCat.name} onChange={(e) => handleNameChange(e.target.value, "new")} placeholder="Ex: Teologia" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={newCat.slug} onChange={(e) => setNewCat((p) => ({ ...p, slug: e.target.value }))} placeholder="teologia" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={newCat.description} onChange={(e) => setNewCat((p) => ({ ...p, description: e.target.value }))} placeholder="Breve descrição..." />
            </div>
            <div className="space-y-2">
              <Label>Ícone (emoji)</Label>
              <Input value={newCat.icon} onChange={(e) => setNewCat((p) => ({ ...p, icon: e.target.value }))} placeholder="📖" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Categoria"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCat} onOpenChange={(v) => { if (!v) setEditingCat(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Categoria</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingCat) return;
              updateMutation.mutate({ id: editingCat.id, ...editValues });
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={editValues.name} onChange={(e) => handleNameChange(e.target.value, "edit")} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={editValues.slug} onChange={(e) => setEditValues((p) => ({ ...p, slug: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={editValues.description} onChange={(e) => setEditValues((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ícone (emoji)</Label>
              <Input value={editValues.icon} onChange={(e) => setEditValues((p) => ({ ...p, icon: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingCat(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
