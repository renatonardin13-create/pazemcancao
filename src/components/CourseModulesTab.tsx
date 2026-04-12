import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "@/lib/admin-modules.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  GripVertical,
  Video,
  FileText,
  Link as LinkIcon,
  File,
  Pencil,
  Copy,
  Trash2,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface CourseModulesTabProps {
  courseId: string;
}

export function CourseModulesTab({ courseId }: CourseModulesTabProps) {
  const queryClient = useQueryClient();
  const queryKey = ["admin-modules", courseId];

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; editId?: string }>({ open: false });
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; moduleId?: string; editId?: string }>({ open: false });

  // Module form state
  const [modTitle, setModTitle] = useState("");
  const [modDesc, setModDesc] = useState("");

  // Lesson form state
  const [lesTitle, setLesTitle] = useState("");
  const [lesDesc, setLesDesc] = useState("");
  const [lesVideoUrl, setLesVideoUrl] = useState("");
  const [lesContentUrl, setLesContentUrl] = useState("");
  const [lesFreePreview, setLesFreePreview] = useState(false);
  const [lesDuration, setLesDuration] = useState("0:00");
  const [lesContentType, setLesContentType] = useState<"video" | "pdf" | "file" | "link">("video");
  const [lesThumbnailUrl, setLesThumbnailUrl] = useState("");
  const [lesPublished, setLesPublished] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listModules({ data: { courseId } }),
  });

  const modules = data?.modules || [];

  // ─── Mutations ───
  const createModM = useMutation({
    mutationFn: (input: { title: string; description?: string }) =>
      createModule({ data: { courseId, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Módulo criado com sucesso");
      setModuleDialog({ open: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateModM = useMutation({
    mutationFn: (input: { id: string; title?: string; description?: string; status?: string }) =>
      updateModule({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Módulo atualizado");
      setModuleDialog({ open: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteModM = useMutation({
    mutationFn: (id: string) => deleteModule({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Módulo excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createLesM = useMutation({
    mutationFn: (input: { moduleId: string; title: string; description?: string; video_url?: string; content_url?: string; is_free_preview?: boolean; duration?: string }) =>
      createLesson({ data: { courseId, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Aula criada com sucesso");
      setLessonDialog({ open: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateLesM = useMutation({
    mutationFn: (input: { id: string; title?: string; description?: string; video_url?: string; content_url?: string; is_free_preview?: boolean; duration?: string }) =>
      updateLesson({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Aula atualizada");
      setLessonDialog({ open: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteLesM = useMutation({
    mutationFn: (id: string) => deleteLesson({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Aula excluída");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorderModM = useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      reorderModules({ data: { items } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const reorderLesM = useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      reorderLessons({ data: { items } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // ─── Helpers ───
  const toggleExpand = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateModule = () => {
    setModTitle("");
    setModDesc("");
    setModuleDialog({ open: true });
  };

  const openEditModule = (mod: any) => {
    setModTitle(mod.title);
    setModDesc(mod.description || "");
    setModuleDialog({ open: true, editId: mod.id });
  };

  const inferContentType = (lesson: any): "video" | "pdf" | "file" | "link" => {
    if (lesson.video_url) return "video";
    if (lesson.content_url?.endsWith(".pdf")) return "pdf";
    if (lesson.content_url) return "file";
    return "link";
  };

  const openCreateLesson = (moduleId: string) => {
    setLesTitle("");
    setLesDesc("");
    setLesVideoUrl("");
    setLesContentUrl("");
    setLesFreePreview(false);
    setLesDuration("0:00");
    setLesContentType("video");
    setLesThumbnailUrl("");
    setLesPublished(true);
    setLessonDialog({ open: true, moduleId });
  };

  const openEditLesson = (lesson: any) => {
    setLesTitle(lesson.title || "");
    setLesDesc(lesson.description || "");
    setLesVideoUrl(lesson.video_url || "");
    setLesContentUrl(lesson.content_url || "");
    setLesFreePreview(lesson.is_free_preview || false);
    setLesDuration(lesson.duration || "0:00");
    setLesContentType(inferContentType(lesson));
    setLesThumbnailUrl("");
    setLesPublished(true);
    setLessonDialog({ open: true, moduleId: lesson.module_id, editId: lesson.id });
  };

  const handleSaveModule = () => {
    if (!modTitle.trim()) return;
    if (moduleDialog.editId) {
      updateModM.mutate({ id: moduleDialog.editId, title: modTitle.trim(), description: modDesc.trim() || undefined });
    } else {
      createModM.mutate({ title: modTitle.trim(), description: modDesc.trim() || undefined });
    }
  };

  const handleSaveLesson = () => {
    if (!lesTitle.trim() || !lessonDialog.moduleId) return;
    const payload = {
      title: lesTitle.trim(),
      description: lesDesc.trim() || undefined,
      video_url: lesVideoUrl.trim() || undefined,
      content_url: lesContentUrl.trim() || undefined,
      is_free_preview: lesFreePreview,
      duration: lesDuration || "0:00",
    };
    if (lessonDialog.editId) {
      updateLesM.mutate({ id: lessonDialog.editId, ...payload });
    } else {
      createLesM.mutate({ moduleId: lessonDialog.moduleId, ...payload });
    }
  };

  const getLessonTypeIcon = (lesson: any) => {
    if (lesson.video_url) return <Video className="h-3.5 w-3.5 text-gold/50" />;
    if (lesson.content_url?.endsWith(".pdf")) return <FileText className="h-3.5 w-3.5 text-red-400/50" />;
    if (lesson.content_url) return <File className="h-3.5 w-3.5 text-blue-400/50" />;
    return <LinkIcon className="h-3.5 w-3.5 text-muted-foreground/30" />;
  };

  const getLessonTypeLabel = (lesson: any) => {
    if (lesson.video_url) return "Vídeo";
    if (lesson.content_url?.endsWith(".pdf")) return "PDF";
    if (lesson.content_url) return "Arquivo";
    return "Link";
  };

  const moveModule = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === modules.length - 1) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const items = modules.map((m: any, i: number) => {
      if (i === index) return { id: m.id, sort_order: modules[swapIndex].sort_order };
      if (i === swapIndex) return { id: m.id, sort_order: modules[index].sort_order };
      return { id: m.id, sort_order: m.sort_order };
    });
    reorderModM.mutate(items);
  };

  const moveLessonInModule = (mod: any, lessonIndex: number, direction: "up" | "down") => {
    const lessons = mod.lessons || [];
    if (direction === "up" && lessonIndex === 0) return;
    if (direction === "down" && lessonIndex === lessons.length - 1) return;
    const swapIndex = direction === "up" ? lessonIndex - 1 : lessonIndex + 1;
    const items = lessons.map((l: any, i: number) => {
      if (i === lessonIndex) return { id: l.id, sort_order: lessons[swapIndex].sort_order };
      if (i === swapIndex) return { id: l.id, sort_order: lessons[lessonIndex].sort_order };
      return { id: l.id, sort_order: l.sort_order };
    });
    reorderLesM.mutate(items);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
          Carregando módulos...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground/70 tracking-tight">
            Módulos e Aulas
          </h3>
          <p className="text-[11px] text-muted-foreground/35 mt-0.5">
            Organize a estrutura do seu curso de forma hierárquica
          </p>
        </div>
        <Button size="sm" onClick={openCreateModule}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Criar Módulo
        </Button>
      </div>

      {/* Empty state */}
      {modules.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/15 bg-card/5">
          <Layers className="h-10 w-10 text-muted-foreground/15 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/40">
            Nenhum módulo cadastrado neste curso.
          </p>
          <Button size="sm" className="mt-4" onClick={openCreateModule}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Criar primeiro módulo
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod: any, modIndex: number) => {
            const isExpanded = expandedModules.has(mod.id);
            const lessons = mod.lessons || [];

            return (
              <div
                key={mod.id}
                className="rounded-xl border border-border/15 bg-card/5 overflow-hidden"
              >
                {/* Module header */}
                <div className="flex items-center gap-2 px-4 py-3 hover:bg-card/10 transition-colors">
                  {/* Drag handle */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      className="text-muted-foreground/20 hover:text-muted-foreground/50 disabled:opacity-30"
                      disabled={modIndex === 0}
                      onClick={() => moveModule(modIndex, "up")}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Expand/collapse */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(mod.id)}
                    className="text-muted-foreground/40 hover:text-muted-foreground/70"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Module name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground/80 truncate">
                      {mod.title}
                    </p>
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant="outline"
                    className={`text-[9px] rounded-full px-2 border ${
                      mod.status === "published"
                        ? "text-emerald-400/80 border-emerald-500/20 bg-emerald-500/10"
                        : "text-gold/60 border-gold/15 bg-gold/8"
                    }`}
                  >
                    {mod.status === "published" ? "Publicado" : "Rascunho"}
                  </Badge>

                  {/* Lesson count */}
                  <span className="text-[11px] text-muted-foreground/30 shrink-0">
                    {lessons.length} aula{lessons.length !== 1 ? "s" : ""}
                  </span>

                  {/* Add lesson */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => openCreateLesson(mod.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Aula
                  </Button>

                  {/* Module actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => openEditModule(mod)} className="gap-2">
                        <Pencil className="h-3.5 w-3.5" />
                        Editar módulo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          updateModM.mutate({
                            id: mod.id,
                            status: mod.status === "published" ? "draft" : "published",
                          });
                        }}
                        className="gap-2"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {mod.status === "published" ? "Despublicar" : "Publicar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => {
                          if (confirm("Excluir este módulo e todas suas aulas?")) {
                            deleteModM.mutate(mod.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir módulo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Expanded: lesson list */}
                {isExpanded && (
                  <div className="border-t border-border/10">
                    {lessons.length === 0 ? (
                      <div className="px-10 py-6 text-center">
                        <p className="text-[11px] text-muted-foreground/30">
                          Nenhuma aula neste módulo.
                        </p>
                      </div>
                    ) : (
                      lessons.map((lesson: any, lesIndex: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-4 pl-12 py-2.5 border-b border-border/5 last:border-0 hover:bg-card/8 transition-colors"
                        >
                          {/* Drag / reorder */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              className="text-muted-foreground/15 hover:text-muted-foreground/40 disabled:opacity-30"
                              disabled={lesIndex === 0}
                              onClick={() => moveLessonInModule(mod, lesIndex, "up")}
                            >
                              <GripVertical className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Icon */}
                          {getLessonTypeIcon(lesson)}

                          {/* Lesson name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-foreground/70 truncate">
                              {lesson.title}
                            </p>
                          </div>

                          {/* Type label */}
                          <span className="text-[10px] text-muted-foreground/30 shrink-0">
                            {getLessonTypeLabel(lesson)}
                          </span>

                          {/* Duration */}
                          {lesson.duration && lesson.duration !== "0:00" && (
                            <span className="text-[10px] text-muted-foreground/25 shrink-0">
                              {lesson.duration}
                            </span>
                          )}

                          {/* Free preview */}
                          {lesson.is_free_preview && (
                            <Badge
                              variant="outline"
                              className="text-[8px] rounded-full px-1.5 border text-blue-400/60 border-blue-500/15 bg-blue-500/8"
                            >
                              Preview
                            </Badge>
                          )}

                          {/* Lesson actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => openEditLesson(lesson)} className="gap-2">
                                <Pencil className="h-3.5 w-3.5" />
                                Editar aula
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-destructive focus:text-destructive"
                                onClick={() => {
                                  if (confirm("Excluir esta aula?")) {
                                    deleteLesM.mutate(lesson.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Excluir aula
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    )}

                    {/* Add lesson at bottom */}
                    <div className="px-4 pl-12 py-2.5 border-t border-border/8">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] text-muted-foreground/40 hover:text-foreground/60"
                        onClick={() => openCreateLesson(mod.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar Aula
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Module Dialog ─── */}
      <Dialog
        open={moduleDialog.open}
        onOpenChange={(open) => {
          if (!open) setModuleDialog({ open: false });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {moduleDialog.editId ? "Editar Módulo" : "Criar Módulo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Módulo *</Label>
              <Input
                value={modTitle}
                onChange={(e) => setModTitle(e.target.value)}
                placeholder="Ex: Módulo 1 — Introdução"
                className="bg-card/10 border-border/15"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={modDesc}
                onChange={(e) => setModDesc(e.target.value)}
                placeholder="Breve descrição do módulo..."
                rows={3}
                className="bg-card/10 border-border/15"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModuleDialog({ open: false })}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveModule}
              disabled={!modTitle.trim() || createModM.isPending || updateModM.isPending}
            >
              {(createModM.isPending || updateModM.isPending) && (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              )}
              {moduleDialog.editId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Lesson Dialog ─── */}
      <Dialog
        open={lessonDialog.open}
        onOpenChange={(open) => {
          if (!open) setLessonDialog({ open: false });
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {lessonDialog.editId ? "Editar Aula" : "Criar Aula"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título da Aula *</Label>
              <Input
                value={lesTitle}
                onChange={(e) => setLesTitle(e.target.value)}
                placeholder="Ex: Aula 1 — Boas-vindas"
                className="bg-card/10 border-border/15"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={lesDesc}
                onChange={(e) => setLesDesc(e.target.value)}
                placeholder="Descrição da aula..."
                rows={3}
                className="bg-card/10 border-border/15"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL do Vídeo</Label>
                <Input
                  value={lesVideoUrl}
                  onChange={(e) => setLesVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card/10 border-border/15"
                />
              </div>
              <div className="space-y-2">
                <Label>URL do Conteúdo/Arquivo</Label>
                <Input
                  value={lesContentUrl}
                  onChange={(e) => setLesContentUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card/10 border-border/15"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duração</Label>
                <Input
                  value={lesDuration}
                  onChange={(e) => setLesDuration(e.target.value)}
                  placeholder="10:30"
                  className="bg-card/10 border-border/15"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={lesFreePreview}
                  onCheckedChange={setLesFreePreview}
                />
                <Label className="text-sm">Preview gratuito</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLessonDialog({ open: false })}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={!lesTitle.trim() || createLesM.isPending || updateLesM.isPending}
            >
              {(createLesM.isPending || updateLesM.isPending) && (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              )}
              {lessonDialog.editId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
