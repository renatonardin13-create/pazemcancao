import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/admin-categories.functions";
import {
  listAdminTags,
  createTag,
  updateTag,
  deleteTag,
} from "@/lib/admin-tags.functions";
import { FolderOpen, Plus, Trash2, Pencil, GripVertical, Tag } from "lucide-react";
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
  // Category state
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editCatValues, setEditCatValues] = useState({ name: "", slug: "", description: "", icon: "", color: "" });
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "", icon: "", color: PICKER_COLORS[0] });

  // Tag state
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [editTagValues, setEditTagValues] = useState({ name: "", slug: "", description: "", color: "" });
  const [newTag, setNewTag] = useState({ name: "", slug: "", description: "", color: PICKER_COLORS[0] });

  const queryClient = useQueryClient();

  // ─── Categories queries/mutations ───
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  const createCatMutation = useMutation({
    mutationFn: (input: { name: string; slug: string; description?: string; icon?: string; color?: string }) =>
      createCategory({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria criada");
      setShowCatForm(false);
      setNewCat({ name: "", slug: "", description: "", icon: "", color: PICKER_COLORS[0] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateCatMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; slug?: string; description?: string; icon?: string; color?: string }) =>
      updateCategory({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria atualizada");
      setEditingCat(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteCatMutation = useMutation({
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

  // ─── Tags queries/mutations ───
  const { data: tagData, isLoading: tagLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => listAdminTags(),
  });

  const createTagMutation = useMutation({
    mutationFn: (input: { name: string; slug: string; description?: string; color?: string }) =>
      createTag({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag criada");
      setShowTagForm(false);
      setNewTag({ name: "", slug: "", description: "", color: PICKER_COLORS[0] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateTagMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; slug?: string; description?: string; color?: string }) =>
      updateTag({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag atualizada");
      setEditingTag(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => deleteTag({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag removida");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const categories = catData?.categories || [];
  const tags = (tagData?.tags || []) as any[];

  const makeSlug = (value: string) =>
    value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCatNameChange = (value: string, target: "new" | "edit") => {
    const slug = makeSlug(value);
    if (target === "new") setNewCat((p) => ({ ...p, name: value, slug }));
    else setEditCatValues((p) => ({ ...p, name: value, slug }));
  };

  const handleTagNameChange = (value: string, target: "new" | "edit") => {
    const slug = makeSlug(value);
    if (target === "new") setNewTag((p) => ({ ...p, name: value, slug }));
    else setEditTagValues((p) => ({ ...p, name: value, slug }));
  };

  const startEditCat = (cat: any) => {
    setEditingCat(cat);
    setEditCatValues({
      name: cat.name, slug: cat.slug,
      description: cat.description || "", icon: cat.icon || "",
      color: cat.color || PICKER_COLORS[0],
    });
  };

  const startEditTag = (tag: any) => {
    setEditingTag(tag);
    setEditTagValues({
      name: tag.name, slug: tag.slug,
      description: tag.description || "",
      color: tag.color || PICKER_COLORS[0],
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

  // ─── Color picker component ───
  const ColorPicker = ({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) => (
    <div className="flex flex-wrap gap-2">
      {PICKER_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className={`h-9 w-9 rounded-full transition-all ${selected === color ? "ring-2 ring-gold ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
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
        {/* ─── Categories Panel ─── */}
        <div className="rounded-2xl border border-border/15 bg-card/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-foreground/85 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-gold/60" />
              Categorias
            </h2>
            <Button
              onClick={() => { setShowCatForm(true); setNewCat({ name: "", slug: "", description: "", icon: "", color: PICKER_COLORS[0] }); }}
              className="gap-1.5 h-9 bg-gold/90 text-gold-foreground hover:bg-gold font-semibold text-[12px]"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Categoria
            </Button>
          </div>

          {catLoading ? (
            <div className="text-center py-12">
              <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">Carregando...</p>
            </div>
          ) : !categories.length ? (
            <div className="text-center py-12">
              <FolderOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/35">Nenhuma categoria cadastrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat: any, index: number) => (
                <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-border/10 bg-card/8 px-4 py-3 hover:bg-card/15 transition-colors group">
                  <GripVertical className="h-4 w-4 text-muted-foreground/15 shrink-0 cursor-grab" />
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color || PICKER_COLORS[index % PICKER_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/85 truncate">{cat.name}</p>
                    {cat.description && <p className="text-[11px] text-muted-foreground/40 truncate">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => startEditCat(cat)} className="p-1.5 text-muted-foreground/30 hover:text-gold/60 transition-colors rounded-lg hover:bg-muted/10" title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (confirm("Remover esta categoria?")) deleteCatMutation.mutate(cat.id); }} className="p-1.5 text-muted-foreground/30 hover:text-destructive/60 transition-colors rounded-lg hover:bg-muted/10" title="Remover">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Tags Panel ─── */}
        <div className="rounded-2xl border border-border/15 bg-card/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-foreground/85 flex items-center gap-2">
              <Tag className="h-4 w-4 text-gold/60" />
              Tags
            </h2>
            <Button
              onClick={() => { setShowTagForm(true); setNewTag({ name: "", slug: "", description: "", color: PICKER_COLORS[0] }); }}
              className="gap-1.5 h-9 bg-gold/90 text-gold-foreground hover:bg-gold font-semibold text-[12px]"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Tag
            </Button>
          </div>

          {tagLoading ? (
            <div className="text-center py-12">
              <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">Carregando...</p>
            </div>
          ) : !tags.length ? (
            <div className="text-center py-12">
              <Tag className="h-8 w-8 text-muted-foreground/15 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/35">Nenhuma tag cadastrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map((tag: any, index: number) => (
                <div key={tag.id} className="flex items-center gap-3 rounded-xl border border-border/10 bg-card/8 px-4 py-3 hover:bg-card/15 transition-colors group">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tag.color || PICKER_COLORS[index % PICKER_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/85 truncate">{tag.name}</p>
                    {tag.description && <p className="text-[11px] text-muted-foreground/40 truncate">{tag.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => startEditTag(tag)} className="p-1.5 text-muted-foreground/30 hover:text-gold/60 transition-colors rounded-lg hover:bg-muted/10" title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (confirm("Remover esta tag?")) deleteTagMutation.mutate(tag.id); }} className="p-1.5 text-muted-foreground/30 hover:text-destructive/60 transition-colors rounded-lg hover:bg-muted/10" title="Remover">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Create Category Dialog ─── */}
      <Dialog open={showCatForm} onOpenChange={setShowCatForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Categoria</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCat.name) { toast.error("Nome é obrigatório"); return; }
              const slug = newCat.slug || makeSlug(newCat.name);
              createCatMutation.mutate({ ...newCat, slug });
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newCat.name} onChange={(e) => handleCatNameChange(e.target.value, "new")} placeholder="Ex: Marketing Digital" />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <ColorPicker selected={newCat.color} onSelect={(c) => setNewCat((p) => ({ ...p, color: c }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea value={newCat.description} onChange={(e) => setNewCat((p) => ({ ...p, description: e.target.value }))} placeholder="Breve descrição da categoria" rows={3} className="resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCatForm(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" disabled={createCatMutation.isPending}>
                {createCatMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Category Dialog ─── */}
      <Dialog open={!!editingCat} onOpenChange={(v) => { if (!v) setEditingCat(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Categoria</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingCat) return;
              updateCatMutation.mutate({ id: editingCat.id, ...editCatValues });
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={editCatValues.name} onChange={(e) => handleCatNameChange(e.target.value, "edit")} />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <ColorPicker selected={editCatValues.color} onSelect={(c) => setEditCatValues((p) => ({ ...p, color: c }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea value={editCatValues.description} onChange={(e) => setEditCatValues((p) => ({ ...p, description: e.target.value }))} placeholder="Breve descrição da categoria" rows={3} className="resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingCat(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" disabled={updateCatMutation.isPending}>
                {updateCatMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Create Tag Dialog ─── */}
      <Dialog open={showTagForm} onOpenChange={setShowTagForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Tag</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTag.name) { toast.error("Nome é obrigatório"); return; }
              const slug = newTag.slug || makeSlug(newTag.name);
              createTagMutation.mutate({ ...newTag, slug });
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newTag.name} onChange={(e) => handleTagNameChange(e.target.value, "new")} placeholder="Ex: Best-seller" />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <ColorPicker selected={newTag.color} onSelect={(c) => setNewTag((p) => ({ ...p, color: c }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea value={newTag.description} onChange={(e) => setNewTag((p) => ({ ...p, description: e.target.value }))} placeholder="Breve descrição da tag" rows={3} className="resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowTagForm(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" disabled={createTagMutation.isPending}>
                {createTagMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Tag Dialog ─── */}
      <Dialog open={!!editingTag} onOpenChange={(v) => { if (!v) setEditingTag(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Tag</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingTag) return;
              updateTagMutation.mutate({ id: editingTag.id, ...editTagValues });
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={editTagValues.name} onChange={(e) => handleTagNameChange(e.target.value, "edit")} />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <ColorPicker selected={editTagValues.color} onSelect={(c) => setEditTagValues((p) => ({ ...p, color: c }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea value={editTagValues.description} onChange={(e) => setEditTagValues((p) => ({ ...p, description: e.target.value }))} placeholder="Breve descrição da tag" rows={3} className="resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingTag(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" disabled={updateTagMutation.isPending}>
                {updateTagMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
