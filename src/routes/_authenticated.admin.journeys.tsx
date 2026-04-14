import { toastError } from "@/lib/toast-utils";
import { ListSkeleton } from "@/components/LoadingSkeletons";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminJourneys,
  createJourney,
  updateJourney,
  deleteJourney,
  reorderJourneys,
} from "@/lib/admin-journeys.functions";
import { Compass, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/journeys")({
  component: AdminJourneysPage,
});

function AdminJourneysPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: "", slug: "", description: "", icon: "" });
  const [newItem, setNewItem] = useState({ name: "", slug: "", description: "", icon: "" });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-journeys"],
    queryFn: () => listAdminJourneys(),
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; slug: string; description?: string; icon?: string }) =>
      createJourney({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-journeys"] });
      toast.success("Trilha criada");
      setShowForm(false);
      setNewItem({ name: "", slug: "", description: "", icon: "" });
    },
    onError: (err: any) => toastError(err),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; slug?: string; description?: string; icon?: string }) =>
      updateJourney({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-journeys"] });
      toast.success("Trilha atualizada");
      setEditingId(null);
    },
    onError: (err: any) => toastError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJourney({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-journeys"] });
      toast.success("Trilha removida");
    },
    onError: (err: any) => toastError(err),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderJourneys({ data: { orderedIds } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-journeys"] });
      toast.success("Ordem atualizada");
    },
    onError: (err: any) => toastError(err),
  });

  const journeys = data?.journeys || [];

  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "");
    setNewItem((prev) => ({ ...prev, name: value, slug }));
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditValues({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      icon: item.icon || "",
    });
  };

  const moveItem = useCallback(
    (index: number, direction: "up" | "down") => {
      const newOrder = [...journeys];
      const swapIdx = direction === "up" ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= newOrder.length) return;
      [newOrder[index], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[index]];
      reorderMutation.mutate(newOrder.map((j: any) => j.id));
    },
    [journeys, reorderMutation]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card p-6 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
              Trilhas Emocionais
            </h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              Gerencie as trilhas de jornada dos conteúdos
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-gold to-gold/85 text-background text-sm font-bold hover:shadow-lg hover:shadow-gold/20 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nova Trilha
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl border border-border/15 bg-card/10 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground/90">Nova Trilha</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 block">Nome</label>
              <Input
                value={newItem.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Para dias difíceis"
                className="bg-card/10 border-border/15"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 block">Slug</label>
              <Input
                value={newItem.slug}
                onChange={(e) => setNewItem((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="para_dias_dificeis"
                className="bg-card/10 border-border/15"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 block">Ícone (emoji)</label>
              <Input
                value={newItem.icon}
                onChange={(e) => setNewItem((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="🌧️"
                className="bg-card/10 border-border/15"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground/40 uppercase tracking-wider mb-1.5 block">Descrição</label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
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
                if (!newItem.name || !newItem.slug) {
                  toast.error("Nome e slug são obrigatórios");
                  return;
                }
                createMutation.mutate(newItem);
              }}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-xl h-9 px-5 text-[11px] font-semibold uppercase tracking-wider bg-gold/20 text-gold/80 border border-gold/15 hover:bg-gold/30 transition-all duration-500 disabled:opacity-50"
            >
              {createMutation.isPending ? "Criando..." : "Criar"}
            </button>
          </div>
        </div>
      )}

      {/* Journey list */}
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !journeys.length ? (
        <div className="text-center py-16 rounded-2xl border border-border/15 bg-card/5">
          <Compass className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/35">Nenhuma trilha cadastrada.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/15 overflow-hidden">
          {journeys.map((item: any, index: number) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-border/8 last:border-0 hover:bg-card/10 transition-colors"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  className="text-muted-foreground/20 hover:text-gold/50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(index, "down")}
                  disabled={index === journeys.length - 1}
                  className="text-muted-foreground/20 hover:text-gold/50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  ▼
                </button>
              </div>

              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/15 shrink-0 text-lg">
                {item.icon || "✨"}
              </div>

              {/* Content */}
              {editingId === item.id ? (
                <div className="flex-1 grid sm:grid-cols-4 gap-2">
                  <Input value={editValues.name} onChange={(e) => setEditValues((p) => ({ ...p, name: e.target.value }))} placeholder="Nome" className="bg-card/10 border-border/15 text-sm h-8" />
                  <Input value={editValues.slug} onChange={(e) => setEditValues((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" className="bg-card/10 border-border/15 text-sm h-8" />
                  <Input value={editValues.icon} onChange={(e) => setEditValues((p) => ({ ...p, icon: e.target.value }))} placeholder="Ícone" className="bg-card/10 border-border/15 text-sm h-8" />
                  <Input value={editValues.description} onChange={(e) => setEditValues((p) => ({ ...p, description: e.target.value }))} placeholder="Descrição" className="bg-card/10 border-border/15 text-sm h-8" />
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground/90 truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground/30">
                    {item.slug}
                    {item.description && ` · ${item.description}`}
                  </p>
                </div>
              )}

              <span className="text-[11px] text-muted-foreground/20 tabular-nums shrink-0">#{item.sort_order}</span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {editingId === item.id ? (
                  <>
                    <button onClick={() => updateMutation.mutate({ id: item.id, ...editValues })} className="p-2 text-emerald-400/50 hover:text-emerald-400/80 transition-colors" title="Salvar">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors" title="Cancelar">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(item)} className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors" title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm("Remover esta trilha?")) deleteMutation.mutate(item.id); }}
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
