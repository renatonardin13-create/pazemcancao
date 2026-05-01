import { EmptyState } from "@/components/EmptyState";
import { toastError } from "@/lib/toast-utils";
import { ListSkeleton } from "@/components/LoadingSkeletons";
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
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
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
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // ─── Categories queries/mutations ───
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  const invalidateStudentCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["student-shelves"] });
  };

  const createCatMutation = useMutation({
    mutationFn: (input: { name: string; slug: string; description?: string; icon?: string; color?: string }) =>
      createCategory({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      invalidateStudentCaches();
      toast.success("Seção criada com sucesso");
      setShowCatForm(false);
      setNewCat({ name: "", slug: "", description: "", icon: "", color: PICKER_COLORS[0] });
    },
    onError: (err: any) => toastError(err),
  });

  const updateCatMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; slug?: string; description?: string; icon?: string; color?: string }) =>
      updateCategory({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      invalidateStudentCaches();
      toast.success("Seção atualizada");
      setEditingCat(null);
    },
    onError: (err: any) => toastError(err),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      invalidateStudentCaches();
      toast.success("Seção removida");
    },
    onError: (err: any) => toastError(err),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderCategories({ data: { orderedIds } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      invalidateStudentCaches();
    },
    onError: (err: any) => toastError(err),
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
    onError: (err: any) => toastError(err),
  });

  const updateTagMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; slug?: string; description?: string; color?: string }) =>
      updateTag({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag atualizada");
      setEditingTag(null);
    },
    onError: (err: any) => toastError(err),
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => deleteTag({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag removida");
    },
    onError: (err: any) => toastError(err),
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
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card p-6 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="relative z-10">
          <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
            Seções e Tags
          </h1>
          <p className="text-xs text-muted-foreground/50 mt-0.5">
            Organize seus cursos com seções e tags personalizadas
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Categories Panel */}
        <div className="rounded-2xl border border-border/30 bg-card p-5 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-foreground/85 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-gold/60" />
              Seções
            </h2>
            <Button
              onClick={() => { setShowCatForm(true); setNewCat({ name: "", slug: "", description: "", icon: "", color: PICKER_COLORS[0] }); }}
              className="gap-1.5 h-9 bg-gold/90 text-gold-foreground hover:bg-gold font-semibold text-[12px]"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Seção
            </Button>
          </div>

          {catLoading ? (
            <ListSkeleton rows={3} />
          ) : !categories.length ? (
            <EmptyState
              icon={FolderOpen}
              title="Nenhum conteúdo criado ainda"
              description="Para vender, você precisa primeiro criar uma seção. Seções organizam seus conteúdos (ex: Módulo 1, Bônus, Aulas)"
              actionLabel="Criar primeira seção"
              onAction={() => setShowCatForm(true)}
              compact
            />
          ) : (
            <div className="space-y-2">
              {categories.map((cat: any, index: number) => (
                <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-border/25 bg-card/8 px-4 py-3 hover:bg-card/15 transition-colors group">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0 cursor-grab" />
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color || PICKER_COLORS[index % PICKER_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/85 truncate">{cat.name}</p>
                    {cat.description && <p className="text-xs text-muted-foreground/70 truncate">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => startEditCat(cat)} className="p-1.5 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-muted/10" title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (confirm("Remover esta seção?")) deleteCatMutation.mutate(cat.id); }} className="p-1.5 text-muted-foreground/60 hover:text-destructive/60 transition-colors rounded-lg hover:bg-muted/10" title="Remover">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Tags Panel ─── */}
        <div className="rounded-2xl border border-border/30 bg-card/15 p-5">
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
            <ListSkeleton rows={3} />
          ) : !tags.length ? (
            <EmptyState
              icon={Tag}
              title="Nenhuma tag cadastrada"
              description="Tags ajudam a filtrar e encontrar conteúdos mais rapidamente."
              compact
            />
          ) : (
            <div className="space-y-2">
              {tags.map((tag: any, index: number) => (
                <div key={tag.id} className="flex items-center gap-3 rounded-xl border border-border/25 bg-card/8 px-4 py-3 hover:bg-card/15 transition-colors group">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: tag.color || PICKER_COLORS[index % PICKER_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/85 truncate">{tag.name}</p>
                    {tag.description && <p className="text-xs text-muted-foreground/70 truncate">{tag.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => startEditTag(tag)} className="p-1.5 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-muted/10" title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (confirm("Remover esta tag?")) deleteTagMutation.mutate(tag.id); }} className="p-1.5 text-muted-foreground/60 hover:text-destructive/60 transition-colors rounded-lg hover:bg-muted/10" title="Remover">
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
            <DialogTitle className="font-display">Nova Seção</DialogTitle>
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
              <Textarea value={newCat.description} onChange={(e) => setNewCat((p) => ({ ...p, description: e.target.value }))} placeholder="Breve descrição da seção" rows={3} className="resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCatForm(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" loading={createCatMutation.isPending}>
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Category Dialog ─── */}
      <Dialog open={!!editingCat} onOpenChange={(v) => { if (!v) setEditingCat(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Seção</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingCat) return;
              if (!editCatValues.name.trim()) { toast.error("Nome é obrigatório"); return; }
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
              <Textarea value={editCatValues.description} onChange={(e) => setEditCatValues((p) => ({ ...p, description: e.target.value }))} placeholder="Breve descrição da seção" rows={3} className="resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingCat(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-gold/90 text-gold-foreground hover:bg-gold" loading={updateCatMutation.isPending}>
                Salvar
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
              if (!editTagValues.name.trim()) { toast.error("Nome é obrigatório"); return; }
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
