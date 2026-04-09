import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/admin-categories.functions";
import { FolderOpen, Plus, Trash2, Pencil, GripVertical, Check, X } from "lucide-react";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; slug: string; description: string; icon: string }>({
    name: "", slug: "", description: "", icon: "",
  });
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "", icon: "" });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; slug: string; description?: string; icon?: string }) =>
      createCategory({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria criada");
      setShowForm(false);
      setNewCat({ name: "", slug: "", description: "", icon: "" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; slug?: string; description?: string; icon?: string }) =>
      updateCategory({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria atualizada");
      setEditingId(null);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Ordem atualizada");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const categories = data?.categories || [];

  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setNewCat((prev) => ({ ...prev, name: value, slug }));
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditValues({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "",
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Categorias
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/40">
            Gerencie as categorias dos cursos
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl h-10 px-4 text-[11px] font-semibold uppercase tracking-wider bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22 transition-all duration-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova Categoria
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl border border-border/15 bg-card/10 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground/70">Nova Categoria</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 block">Nome</label>
              <Input
                value={newCat.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Música Gospel"
                className="bg-card/10 border-border/15"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 block">Slug</label>
              <Input
                value={newCat.slug}
                onChange={(e) => setNewCat((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="musica-gospel"
                className="bg-card/10 border-border/15"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 block">Ícone (emoji)</label>
              <Input
                value={newCat.icon}
                onChange={(e) => setNewCat((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="🎵"
                className="bg-card/10 border-border/15"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 block">Descrição</label>
              <Input
                value={newCat.description}
                onChange={(e) => setNewCat((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição..."
                className="bg-card/10 border-border/15"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!newCat.name || !newCat.slug) {
                  toast.error("Nome e slug são obrigatórios");
                  return;
                }
                createMutation.mutate(newCat);
              }}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-xl h-9 px-5 text-[11px] font-semibold uppercase tracking-wider bg-gold/20 text-gold/80 border border-gold/15 hover:bg-gold/30 transition-all duration-500 disabled:opacity-50"
            >
              {createMutation.isPending ? "Criando..." : "Criar"}
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
            Carregando...
          </p>
        </div>
      ) : !categories.length ? (
        <div className="text-center py-16 rounded-2xl border border-border/15 bg-card/5">
          <FolderOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/35">Nenhuma categoria cadastrada.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/15 overflow-hidden">
          {categories.map((cat: any, index: number) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-border/8 last:border-0 hover:bg-card/10 transition-colors"
            >
              {/* Reorder controls */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveCategory(index, "up")}
                  disabled={index === 0}
                  className="text-muted-foreground/20 hover:text-gold/50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-[10px]"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveCategory(index, "down")}
                  disabled={index === categories.length - 1}
                  className="text-muted-foreground/20 hover:text-gold/50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-[10px]"
                >
                  ▼
                </button>
              </div>

              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/15 shrink-0 text-lg">
                {cat.icon || "📁"}
              </div>

              {/* Content - view or edit mode */}
              {editingId === cat.id ? (
                <div className="flex-1 grid sm:grid-cols-4 gap-2">
                  <Input
                    value={editValues.name}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome"
                    className="bg-card/10 border-border/15 text-sm h-8"
                  />
                  <Input
                    value={editValues.slug}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="Slug"
                    className="bg-card/10 border-border/15 text-sm h-8"
                  />
                  <Input
                    value={editValues.icon}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="Ícone"
                    className="bg-card/10 border-border/15 text-sm h-8"
                  />
                  <Input
                    value={editValues.description}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição"
                    className="bg-card/10 border-border/15 text-sm h-8"
                  />
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground/75 truncate">
                    {cat.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground/30">
                    /{cat.slug}
                    {cat.description && ` · ${cat.description}`}
                  </p>
                </div>
              )}

              {/* Sort order badge */}
              <span className="text-[9px] text-muted-foreground/20 tabular-nums shrink-0">
                #{cat.sort_order}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {editingId === cat.id ? (
                  <>
                    <button
                      onClick={() => {
                        updateMutation.mutate({ id: cat.id, ...editValues });
                      }}
                      className="p-2 text-emerald-400/50 hover:text-emerald-400/80 transition-colors"
                      title="Salvar"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                      title="Cancelar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Remover esta categoria?")) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                      className="p-2 text-muted-foreground/30 hover:text-destructive/60 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
