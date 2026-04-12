import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Layout,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  listShelves,
  createShelf,
  updateShelf,
  deleteShelf,
  setShelfCourses,
  reorderShelves,
  reorderShelfCourses,
} from "@/lib/admin-shelves.functions";
import { listCoursesForSelector } from "@/lib/admin-trial.functions";

export const Route = createFileRoute("/_authenticated/admin/shelves")({
  component: AdminShelvesPage,
});

/* ── Generic drag-and-drop hook ── */

function useDragReorder<T extends { id: string }>(
  items: T[],
  onReorder: (newItems: T[]) => void
) {
  const dragIdx = useRef<number | null>(null);
  const overIdx = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      dragIdx.current = index;
      e.dataTransfer.effectAllowed = "move";
      // For Firefox
      e.dataTransfer.setData("text/plain", String(index));
      const el = e.currentTarget as HTMLElement;
      el.style.opacity = "0.5";
    },
    []
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.opacity = "1";
      if (
        dragIdx.current !== null &&
        overIdx.current !== null &&
        dragIdx.current !== overIdx.current
      ) {
        const newItems = [...items];
        const [moved] = newItems.splice(dragIdx.current, 1);
        newItems.splice(overIdx.current, 0, moved);
        onReorder(newItems);
      }
      dragIdx.current = null;
      overIdx.current = null;
    },
    [items, onReorder]
  );

  const handleDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      overIdx.current = index;
    },
    []
  );

  return { handleDragStart, handleDragEnd, handleDragOver };
}

/* ── Page ── */

function AdminShelvesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShelf, setEditingShelf] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [coursesDialogShelf, setCoursesDialogShelf] = useState<any>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formMode, setFormMode] = useState<string>("manual");
  const [formCriteria, setFormCriteria] = useState("recent");
  const [formOrder, setFormOrder] = useState(0);

  // Course selection state
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-shelves"],
    queryFn: () => listShelves(),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-selector"],
    queryFn: () => listCoursesForSelector(),
  });

  const shelves = data?.shelves ?? [];
  const courses = coursesData?.courses ?? [];

  // ── Mutations ──

  const createMut = useMutation({
    mutationFn: (input: any) => createShelf({ data: input }),
    onSuccess: () => {
      toast.success("Prateleira criada!");
      queryClient.invalidateQueries({ queryKey: ["admin-shelves"] });
      closeDialog();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMut = useMutation({
    mutationFn: (input: any) => updateShelf({ data: input }),
    onSuccess: () => {
      toast.success("Prateleira atualizada!");
      queryClient.invalidateQueries({ queryKey: ["admin-shelves"] });
      closeDialog();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteShelf({ data: { id } }),
    onSuccess: () => {
      toast.success("Prateleira excluída!");
      queryClient.invalidateQueries({ queryKey: ["admin-shelves"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const setCoursesMut = useMutation({
    mutationFn: (input: { shelfId: string; courseIds: string[] }) =>
      setShelfCourses({ data: input }),
    onSuccess: () => {
      toast.success("Cursos atualizados!");
      queryClient.invalidateQueries({ queryKey: ["admin-shelves"] });
      setCoursesDialogShelf(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const reorderShelvesMut = useMutation({
    mutationFn: (orderedIds: string[]) =>
      reorderShelves({ data: { orderedIds } }),
    onSuccess: () => {
      toast.success("Ordem das prateleiras atualizada!");
      queryClient.invalidateQueries({ queryKey: ["admin-shelves"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const reorderCoursesMut = useMutation({
    mutationFn: (input: { shelfId: string; orderedCourseIds: string[] }) =>
      reorderShelfCourses({ data: input }),
    onSuccess: () => {
      toast.success("Ordem dos cursos atualizada!");
      queryClient.invalidateQueries({ queryKey: ["admin-shelves"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // ── Drag and drop for shelves ──

  const shelfDrag = useDragReorder(shelves, (newShelves) => {
    reorderShelvesMut.mutate(newShelves.map((s: any) => s.id));
  });

  // ── Dialog handlers ──

  const openCreate = () => {
    setEditingShelf(null);
    setFormName("");
    setFormActive(true);
    setFormMode("manual");
    setFormCriteria("recent");
    setFormOrder(shelves.length);
    setDialogOpen(true);
  };

  const openEdit = (shelf: any) => {
    setEditingShelf(shelf);
    setFormName(shelf.name);
    setFormActive(shelf.is_active);
    setFormMode(shelf.mode);
    setFormCriteria(shelf.auto_criteria || "recent");
    setFormOrder(shelf.sort_order);
    setDialogOpen(true);
  };

  const openCourses = (shelf: any) => {
    setCoursesDialogShelf(shelf);
    const existing = (shelf.shelf_courses || [])
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((sc: any) => sc.course_id);
    setSelectedCourseIds(existing);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingShelf(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      is_active: formActive,
      mode: formMode,
      auto_criteria: formMode === "auto" ? formCriteria : undefined,
      sort_order: formOrder,
    };

    if (editingShelf) {
      updateMut.mutate({ id: editingShelf.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const modeLabel = (mode: string) =>
    mode === "auto" ? "Automática" : "Manual";
  const criteriaLabel = (c: string) => {
    const map: Record<string, string> = {
      recent: "Mais recentes",
      best_selling: "Mais liberados",
      featured: "Em destaque",
      enrolled: "Cursos liberados",
      all: "Todos",
    };
    return map[c] || c;
  };

  // ── Courses drag reorder within the dialog ──

  const coursesDrag = useDragReorder(
    selectedCourseIds.map((id) => ({ id })),
    (newItems) => {
      setSelectedCourseIds(newItems.map((item) => item.id));
    }
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Prateleiras
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/40">
            Organize a vitrine da área do aluno — arraste para reordenar
          </p>
        </div>
        <Button
          className="gap-2 bg-gold/90 text-black hover:bg-gold"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          Nova Prateleira
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
            Carregando prateleiras...
          </p>
        </div>
      ) : shelves.length === 0 ? (
        <div className="rounded-2xl border border-border/15 bg-card/5 py-16 text-center">
          <Layout className="mx-auto mb-4 h-8 w-8 text-muted-foreground/15" />
          <p className="text-sm text-muted-foreground/35">
            Nenhuma prateleira criada ainda.
          </p>
          <p className="text-[12px] text-muted-foreground/25 mt-1">
            Crie prateleiras para organizar os cursos na vitrine do aluno.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shelves.map((shelf: any, idx: number) => {
            const courseCount = shelf.shelf_courses?.length || 0;
            return (
              <div
                key={shelf.id}
                draggable
                onDragStart={shelfDrag.handleDragStart(idx)}
                onDragEnd={shelfDrag.handleDragEnd}
                onDragOver={shelfDrag.handleDragOver(idx)}
                className="flex items-center gap-4 rounded-2xl border border-border/15 bg-card/10 px-5 py-4 transition-all hover:bg-card/15 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/20 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground/80 truncate">
                      {shelf.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${
                        shelf.is_active
                          ? "text-emerald-400/70 border-emerald-500/20"
                          : "text-muted-foreground/40 border-border/15"
                      }`}
                    >
                      {shelf.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[9px] text-muted-foreground/50 border-border/15"
                    >
                      {modeLabel(shelf.mode)}
                    </Badge>
                    {shelf.mode === "auto" && (
                      <Badge
                        variant="outline"
                        className="text-[9px] text-gold/50 border-gold/15"
                      >
                        {criteriaLabel(shelf.auto_criteria)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/30 mt-0.5">
                    {shelf.mode === "manual"
                      ? `${courseCount} curso(s) vinculado(s)`
                      : `Preenchimento automático: ${criteriaLabel(shelf.auto_criteria)}`}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {shelf.mode === "manual" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground/30 hover:text-gold/70"
                      onClick={() => openCourses(shelf)}
                      title="Gerenciar cursos"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground/30 hover:text-foreground/60"
                    onClick={() => openEdit(shelf)}
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground/30 hover:text-destructive/70"
                    onClick={() => setDeleteTarget(shelf)}
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingShelf ? "Editar Prateleira" : "Nova Prateleira"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Lançamentos"
                required
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/10 border border-border/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground/70">Ativa</p>
                <p className="text-[11px] text-muted-foreground/40">
                  Visível na área do aluno
                </p>
              </div>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
            </div>

            <div className="space-y-2">
              <Label>Modo</Label>
              <Select value={formMode} onValueChange={setFormMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">
                    Manual — eu escolho os cursos
                  </SelectItem>
                  <SelectItem value="auto">
                    Automática — por critério
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formMode === "auto" && (
              <div className="space-y-2">
                <Label>Critério</Label>
                <Select value={formCriteria} onValueChange={setFormCriteria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="best_selling">
                      Mais liberados
                    </SelectItem>
                    <SelectItem value="featured">Em destaque</SelectItem>
                    <SelectItem value="enrolled">
                      Cursos liberados do aluno
                    </SelectItem>
                    <SelectItem value="all">Todos os cursos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Ordem de exibição</Label>
              <Input
                type="number"
                min={0}
                max={999}
                value={formOrder}
                onChange={(e) => setFormOrder(Number(e.target.value))}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gold/90 text-black hover:bg-gold"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending
                ? "Salvando..."
                : editingShelf
                  ? "Salvar"
                  : "Criar Prateleira"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Courses Dialog with drag-and-drop ordering */}
      <Dialog
        open={!!coursesDialogShelf}
        onOpenChange={(v) => {
          if (!v) setCoursesDialogShelf(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Cursos — {coursesDialogShelf?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Selected courses - draggable order */}
            {selectedCourseIds.length > 0 && (
              <div>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground/40 mb-2 block">
                  Ordem dos cursos (arraste para reordenar)
                </Label>
                <div className="rounded-xl border border-border/10 bg-muted/5 divide-y divide-border/5">
                  {selectedCourseIds.map((courseId, idx) => {
                    const course = courses.find((c: any) => c.id === courseId);
                    if (!course) return null;
                    return (
                      <div
                        key={courseId}
                        draggable
                        onDragStart={coursesDrag.handleDragStart(idx)}
                        onDragEnd={coursesDrag.handleDragEnd}
                        onDragOver={coursesDrag.handleDragOver(idx)}
                        className="flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing hover:bg-muted/10 transition-colors"
                      >
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/20 shrink-0" />
                        <span className="text-[10px] font-bold text-muted-foreground/20 tabular-nums w-5 shrink-0">
                          {idx + 1}
                        </span>
                        {course.cover_image_url && (
                          <img
                            src={course.cover_image_url}
                            alt=""
                            className="h-8 w-8 rounded-md object-cover shrink-0"
                          />
                        )}
                        <span className="text-sm font-medium text-foreground/70 truncate flex-1">
                          {course.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCourse(courseId)}
                          className="text-[10px] text-destructive/50 hover:text-destructive/80 shrink-0 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available courses to add */}
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground/40 mb-2 block">
                Adicionar cursos
              </Label>
              {courses.length === 0 ? (
                <p className="text-[12px] text-muted-foreground/40 text-center py-4">
                  Nenhum curso cadastrado.
                </p>
              ) : (
                <div className="rounded-xl border border-border/10 bg-muted/5 max-h-48 overflow-y-auto divide-y divide-border/5">
                  {courses
                    .filter(
                      (c: any) => !selectedCourseIds.includes(c.id)
                    )
                    .map((course: any) => (
                      <label
                        key={course.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/10"
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => toggleCourse(course.id)}
                        />
                        {course.cover_image_url && (
                          <img
                            src={course.cover_image_url}
                            alt=""
                            className="h-8 w-8 rounded-md object-cover shrink-0"
                          />
                        )}
                        <span className="text-sm font-medium text-foreground/70 truncate flex-1">
                          {course.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] shrink-0 ${
                            course.status === "published"
                              ? "text-emerald-400/70 border-emerald-500/20"
                              : "text-muted-foreground/40 border-border/15"
                          }`}
                        >
                          {course.status === "published"
                            ? "Publicado"
                            : "Rascunho"}
                        </Badge>
                      </label>
                    ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-gold/60">
              {selectedCourseIds.length} curso(s) selecionado(s)
            </p>
            <Button
              className="w-full bg-gold/90 text-black hover:bg-gold"
              disabled={setCoursesMut.isPending}
              onClick={() => {
                if (coursesDialogShelf) {
                  setCoursesMut.mutate({
                    shelfId: coursesDialogShelf.id,
                    courseIds: selectedCourseIds,
                  });
                }
              }}
            >
              {setCoursesMut.isPending ? "Salvando..." : "Salvar Cursos"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="bg-card border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground/85">
              Excluir prateleira
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/50">
              Tem certeza que deseja excluir a prateleira{" "}
              <span className="font-semibold text-foreground/70">
                {deleteTarget?.name}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground/50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteMut.mutate(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="bg-destructive/80 text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
