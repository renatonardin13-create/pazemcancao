import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
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
import {
  listLessonMaterials,
  createLessonMaterial,
  deleteLessonMaterial,
} from "@/lib/lesson-materials.functions";
import { supabase } from "@/integrations/supabase/client";
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
  ChevronUp,
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
  Download,
  ExternalLink,
  X,
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

  // Materials state
  const [matTitle, setMatTitle] = useState("");
  const [matUrl, setMatUrl] = useState("");
  const [matFile, setMatFile] = useState<File | null>(null);
  const [matType, setMatType] = useState<"file" | "link" | "pdf">("file");

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
    mutationFn: (input: { moduleId: string; title: string; description?: string; video_url?: string; content_url?: string; content_type?: string; is_free_preview?: boolean; duration?: string }) =>
      createLesson({ data: { courseId, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Aula criada com sucesso");
      setLessonDialog({ open: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateLesM = useMutation({
    mutationFn: (input: { id: string; title?: string; description?: string; video_url?: string; content_url?: string; content_type?: string; is_free_preview?: boolean; duration?: string }) =>
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

  // ─── Materials queries/mutations ───
  const materialsQueryKey = ["lesson-materials", lessonDialog.editId];
  const { data: materialsData } = useQuery({
    queryKey: materialsQueryKey,
    queryFn: () => listLessonMaterials({ data: { lessonId: lessonDialog.editId! } }),
    enabled: !!lessonDialog.editId,
  });
  const materials = materialsData?.materials || [];

  const createMatM = useMutation({
    mutationFn: async (input: {
      lessonId: string;
      title: string;
      material_type: "file" | "link" | "pdf";
      url?: string;
      file?: File | null;
    }) => {
      let finalUrl = input.url?.trim() || "";

      if (!finalUrl && input.file) {
        const extension = input.file.name.split(".").pop() || "bin";
        const baseName = input.file.name
          .replace(/\.[^/.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60) || "material";
        const path = `lesson-materials/${input.lessonId}/${Date.now()}-${baseName}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("content-files")
          .upload(path, input.file, { upsert: true });

        if (uploadError) {
          throw new Error("Erro no upload do material: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage.from("content-files").getPublicUrl(path);
        finalUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      }

      if (!finalUrl) {
        throw new Error(
          input.material_type === "link"
            ? "Informe o link do material"
            : "Envie um arquivo ou informe a URL do material"
        );
      }

      return createLessonMaterial({
        data: {
          lessonId: input.lessonId,
          title: input.title,
          material_type: input.material_type,
          url: finalUrl,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsQueryKey });
      setMatTitle("");
      setMatUrl("");
      setMatFile(null);
      setMatType("file");
      toast.success("Material adicionado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMatM = useMutation({
    mutationFn: (id: string) => deleteLessonMaterial({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsQueryKey });
      toast.success("Material removido");
    },
    onError: (e: Error) => toast.error(e.message),
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
    if (lesson.content_type && lesson.content_type !== 'video') return lesson.content_type;
    if (lesson.video_url) return "video";
    if (lesson.content_url?.endsWith(".pdf")) return "pdf";
    if (lesson.content_url) return "file";
    return "video";
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
      video_url: lesContentType === "video" ? (lesVideoUrl.trim() || undefined) : undefined,
      content_url: lesContentType !== "video" ? (lesContentUrl.trim() || undefined) : undefined,
      content_type: lesContentType,
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
      <div className="flex items-center justify-between pb-4 border-b border-border/8">
        <div>
          <h3 className="text-sm font-semibold text-foreground/70 tracking-tight">
            Módulos e Aulas
          </h3>
          <p className="text-[11px] text-muted-foreground/35 mt-1">
            Organize a estrutura do seu curso de forma hierárquica
          </p>
        </div>
        <Button
          size="sm"
          onClick={openCreateModule}
          className="bg-gold/90 text-gold-foreground hover:bg-gold shadow-lg shadow-gold/20 hover:shadow-gold/30 font-semibold"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Criar Módulo
        </Button>
      </div>

      {/* Empty state */}
      {modules.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-border/12 bg-card/3">
          <div className="w-14 h-14 rounded-2xl bg-gold/8 border border-gold/15 flex items-center justify-center mx-auto mb-5">
            <Layers className="h-7 w-7 text-gold/40" />
          </div>
          <p className="text-sm font-medium text-foreground/50 mb-1">
            Nenhum módulo criado ainda
          </p>
          <p className="text-[12px] text-muted-foreground/30 max-w-xs mx-auto">
            Crie o primeiro módulo para organizar seu curso.
          </p>
          <Button
            size="sm"
            className="mt-6 bg-gold/90 text-gold-foreground hover:bg-gold shadow-lg shadow-gold/20"
            onClick={openCreateModule}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
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
                className="rounded-xl border border-border/15 bg-card/8 overflow-hidden transition-all shadow-sm"
              >
                {/* Module header */}
                <div className={`flex items-center gap-3 px-5 py-4 transition-colors ${isExpanded ? "bg-card/12" : "hover:bg-card/10"}`}>
                  {/* Drag handle — up/down */}
                  <div className="flex flex-col items-center shrink-0 -my-1">
                    <button
                      type="button"
                      className="p-0.5 text-muted-foreground/15 hover:text-gold/60 disabled:opacity-15 transition-colors"
                      disabled={modIndex === 0}
                      onClick={() => moveModule(modIndex, "up")}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/15 cursor-grab active:cursor-grabbing" />
                    <button
                      type="button"
                      className="p-0.5 text-muted-foreground/15 hover:text-gold/60 disabled:opacity-15 transition-colors"
                      disabled={modIndex === modules.length - 1}
                      onClick={() => moveModule(modIndex, "down")}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Expand/collapse */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(mod.id)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all shrink-0 ${isExpanded ? "bg-gold/10 border-gold/20 text-gold/70" : "bg-card/10 border-border/10 text-muted-foreground/35 hover:text-foreground/60 hover:border-border/25"}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {/* Module name */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(mod.id)}>
                    <p className="text-[13px] font-bold text-foreground/90 truncate">
                      {mod.title}
                    </p>
                    {mod.description && (
                      <p className="text-[10px] text-muted-foreground/30 truncate mt-0.5">
                        {mod.description}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <StatusBadge status={mod.status} />

                  {/* Lesson count */}
                  <span className="text-[10px] font-medium text-muted-foreground/40 shrink-0 tabular-nums px-2.5 py-1 rounded-lg bg-card/15 border border-border/10">
                    {lessons.length} aula{lessons.length !== 1 ? "s" : ""}
                  </span>

                  {/* Add lesson */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3.5 text-[10px] font-semibold border-gold/20 text-gold/70 hover:text-gold hover:border-gold/30 hover:bg-gold/8 shrink-0"
                    onClick={() => openCreateLesson(mod.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Aula
                  </Button>

                  {/* Module actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/30 hover:text-foreground/60 shrink-0">
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
                          createModM.mutate({ title: `${mod.title} (cópia)`, description: mod.description || undefined });
                        }}
                        className="gap-2"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicar módulo
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
                  <div className="border-t border-border/10 px-5 py-4 space-y-2">
                    {lessons.length === 0 ? (
                      <div className="text-center py-8 rounded-lg border border-dashed border-border/10 bg-card/3">
                        <div className="w-10 h-10 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center mx-auto mb-3">
                          <FileText className="h-5 w-5 text-gold/30" />
                        </div>
                        <p className="text-[12px] font-medium text-foreground/45 mb-0.5">
                          Este módulo ainda não possui aulas.
                        </p>
                        <p className="text-[11px] text-muted-foreground/25 max-w-[220px] mx-auto">
                          Clique em adicionar aula para começar.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 h-7 px-3 text-[11px] border-gold/15 text-gold/60 hover:text-gold hover:border-gold/30 hover:bg-gold/5"
                          onClick={() => openCreateLesson(mod.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar Aula
                        </Button>
                      </div>
                    ) : (
                      <>
                        {lessons.map((lesson: any, lesIndex: number) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/12 bg-card/5 hover:bg-card/10 hover:border-border/20 transition-all group"
                          >
                            {/* Drag handle */}
                            <GripVertical className="h-4 w-4 text-muted-foreground/15 cursor-grab active:cursor-grabbing shrink-0" />

                            {/* Content type icon */}
                            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                              {lesson.content_type === "pdf" || lesson.content_url?.endsWith(".pdf") ? (
                                <FileText className="h-4 w-4 text-gold/70" />
                              ) : lesson.video_url ? (
                                <Video className="h-4 w-4 text-gold/70" />
                              ) : lesson.content_url ? (
                                <File className="h-4 w-4 text-gold/70" />
                              ) : (
                                <LinkIcon className="h-4 w-4 text-gold/70" />
                              )}
                            </div>

                            {/* Lesson title + type */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-foreground/85 truncate font-semibold">
                                {lesson.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                                {getLessonTypeLabel(lesson)}
                              </p>
                            </div>

                            {/* Free preview badge */}
                            {lesson.is_free_preview && (
                              <Badge
                                variant="outline"
                                className="text-[9px] rounded-full px-2 py-0 border text-blue-400/70 border-blue-500/20 bg-blue-500/8 font-medium shrink-0"
                              >
                                Preview
                              </Badge>
                            )}

                            {/* Published badge */}
                            <StatusBadge status="published" />

                            {/* Lesson actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/30 hover:text-foreground/60 shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => openEditLesson(lesson)} className="gap-2">
                                  <Pencil className="h-3.5 w-3.5" />
                                  Editar aula
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    createLesM.mutate({
                                      moduleId: mod.id,
                                      title: `${lesson.title} (cópia)`,
                                      description: lesson.description || undefined,
                                      video_url: lesson.video_url || undefined,
                                      content_url: lesson.content_url || undefined,
                                      content_type: lesson.content_type || "video",
                                      is_free_preview: lesson.is_free_preview || false,
                                      duration: lesson.duration || "0:00",
                                    });
                                  }}
                                  className="gap-2"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Duplicar aula
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
                        ))}

                        {/* Add lesson — full width */}
                        <button
                          type="button"
                          onClick={() => openCreateLesson(mod.id)}
                          className="w-full py-3 rounded-xl border border-dashed border-gold/15 bg-gold/3 text-gold/50 hover:text-gold/80 hover:bg-gold/8 hover:border-gold/25 transition-all text-[12px] font-medium flex items-center justify-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Adicionar Aula
                        </button>
                      </>
                    )}
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
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {lessonDialog.editId ? "Editar Aula" : "Nova Aula"}
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground/40 mt-0.5">
              {lessonDialog.editId
                ? "Atualize as informações da aula"
                : "Preencha os dados da nova aula"}
            </p>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* ── Main fields ── */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Aula *</Label>
                <Input
                  value={lesTitle}
                  onChange={(e) => setLesTitle(e.target.value)}
                  placeholder="Ex: Aula 1 — Boas-vindas"
                  className="bg-card/10 border-border/15"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={lesDesc}
                  onChange={(e) => setLesDesc(e.target.value)}
                  placeholder="Descrição da aula..."
                  rows={3}
                  className="bg-card/10 border-border/15"
                />
              </div>
            </div>

            {/* ── Content type selector ── */}
            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                Tipo de Conteúdo
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { value: "video" as const, label: "Vídeo", icon: Video },
                  { value: "pdf" as const, label: "PDF", icon: FileText },
                  { value: "file" as const, label: "Arquivo", icon: File },
                  { value: "link" as const, label: "Link", icon: LinkIcon },
                ]).map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setLesContentType(type.value)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all duration-200 ${
                      lesContentType === type.value
                        ? "border-gold/30 bg-gold/10 text-gold"
                        : "border-border/15 bg-card/5 text-muted-foreground/40 hover:border-border/30"
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="text-[11px] font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Dynamic fields by type ── */}
            <div className="rounded-xl border border-border/15 bg-card/5 p-4 space-y-4">
              {lesContentType === "video" && (
                <>
                  <div className="space-y-2">
                    <Label>URL do Vídeo ou Código Embed</Label>
                    <Input
                      value={lesVideoUrl}
                      onChange={(e) => setLesVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... ou código embed"
                      className="bg-card/10 border-border/15"
                    />
                    <p className="text-[10px] text-muted-foreground/30">
                      YouTube, Vimeo, Panda Video ou embed personalizado
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Miniatura (opcional)</Label>
                    <Input
                      value={lesThumbnailUrl}
                      onChange={(e) => setLesThumbnailUrl(e.target.value)}
                      placeholder="https://... imagem de capa do vídeo"
                      className="bg-card/10 border-border/15"
                    />
                    <p className="text-[10px] text-muted-foreground/30">
                      Proporção recomendada: 16:9 — 1280x720 px
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Duração</Label>
                    <Input
                      value={lesDuration}
                      onChange={(e) => setLesDuration(e.target.value)}
                      placeholder="10:30"
                      className="bg-card/10 border-border/15 w-32"
                    />
                  </div>
                </>
              )}

              {lesContentType === "pdf" && (
                <div className="space-y-2">
                  <Label>URL do PDF</Label>
                  <Input
                    value={lesContentUrl}
                    onChange={(e) => setLesContentUrl(e.target.value)}
                    placeholder="https://... link direto do PDF"
                    className="bg-card/10 border-border/15"
                  />
                  <p className="text-[10px] text-muted-foreground/30">
                    Cole a URL pública do arquivo PDF
                  </p>
                </div>
              )}

              {lesContentType === "file" && (
                <div className="space-y-2">
                  <Label>URL do Arquivo</Label>
                  <Input
                    value={lesContentUrl}
                    onChange={(e) => setLesContentUrl(e.target.value)}
                    placeholder="https://... link direto do arquivo"
                    className="bg-card/10 border-border/15"
                  />
                  <p className="text-[10px] text-muted-foreground/30">
                    Formatos aceitos: ZIP, DOCX, XLSX, MP3, etc.
                  </p>
                </div>
              )}

              {lesContentType === "link" && (
                <div className="space-y-2">
                  <Label>URL Externa</Label>
                  <Input
                    value={lesContentUrl}
                    onChange={(e) => setLesContentUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-card/10 border-border/15"
                  />
                  <p className="text-[10px] text-muted-foreground/30">
                    Link para um recurso externo (site, ferramenta, etc.)
                  </p>
                </div>
              )}
            </div>

            {/* ── Materiais Complementares ── */}
            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                Materiais Complementares
              </Label>

              {materials.length > 0 && (
                <div className="space-y-2">
                  {materials.map((mat: any) => (
                    <div key={mat.id} className="flex items-center gap-3 rounded-xl bg-card/5 border border-border/10 px-4 py-2.5">
                      {mat.material_type === "link" ? (
                        <ExternalLink className="h-3.5 w-3.5 text-gold/40 shrink-0" />
                      ) : mat.material_type === "pdf" ? (
                        <FileText className="h-3.5 w-3.5 text-gold/40 shrink-0" />
                      ) : (
                        <File className="h-3.5 w-3.5 text-gold/40 shrink-0" />
                      )}
                      <span className="text-[12px] text-foreground/60 flex-1 truncate">{mat.title}</span>
                      <span className="text-[10px] text-muted-foreground/30 uppercase">{mat.material_type}</span>
                      <button
                        type="button"
                        onClick={() => deleteMatM.mutate(mat.id)}
                        className="text-muted-foreground/30 hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {lessonDialog.editId ? (
                <div className="rounded-xl border border-dashed border-border/20 bg-card/3 p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(["file", "pdf", "link"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setMatType(t);
                          setMatUrl("");
                          setMatFile(null);
                        }}
                        className={`text-[10px] font-medium uppercase py-1.5 rounded-lg border transition-all ${
                          matType === t
                            ? "border-gold/25 bg-gold/8 text-gold/70"
                            : "border-border/10 text-muted-foreground/30 hover:border-border/25"
                        }`}
                      >
                        {t === "file" ? "Arquivo" : t === "pdf" ? "PDF" : "Link"}
                      </button>
                    ))}
                  </div>

                  <Input
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    placeholder="Nome do material"
                    className="bg-card/10 border-border/15 text-sm"
                  />

                  {matType === "link" ? (
                    <Input
                      value={matUrl}
                      onChange={(e) => setMatUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-card/10 border-border/15 text-sm"
                    />
                  ) : (
                    <div className="space-y-3">
                      <Input
                        type="file"
                        accept={matType === "pdf" ? ".pdf,application/pdf" : undefined}
                        onChange={(e) => setMatFile(e.target.files?.[0] || null)}
                        className="bg-card/10 border-border/15 text-sm"
                      />
                      <div className="text-center text-[10px] text-muted-foreground/30">ou</div>
                      <Input
                        value={matUrl}
                        onChange={(e) => setMatUrl(e.target.value)}
                        placeholder="URL pública do arquivo (opcional)"
                        className="bg-card/10 border-border/15 text-sm"
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      !matTitle.trim() ||
                      (matType === "link" ? !matUrl.trim() : !matFile && !matUrl.trim()) ||
                      createMatM.isPending
                    }
                    onClick={() => {
                      createMatM.mutate({
                        lessonId: lessonDialog.editId!,
                        title: matTitle.trim(),
                        material_type: matType,
                        url: matUrl.trim() || undefined,
                        file: matFile,
                      });
                    }}
                    className="w-full gap-1.5"
                  >
                    {createMatM.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Adicionar Material
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/20 bg-card/3 p-4 text-center">
                  <p className="text-[11px] text-muted-foreground/30">
                    Salve a aula primeiro para adicionar materiais complementares.
                  </p>
                </div>
              )}
            </div>

            {/* ── Publication ── */}
            <div className="flex items-center justify-between rounded-xl border border-border/15 bg-card/5 p-4">
              <div>
                <Label className="text-sm font-medium">Publicar aula</Label>
                <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                  Aulas publicadas ficam visíveis para os alunos
                </p>
              </div>
              <Switch checked={lesPublished} onCheckedChange={setLesPublished} />
            </div>

            {/* ── Free preview toggle ── */}
            <div className="flex items-center justify-between rounded-xl border border-border/15 bg-card/5 p-4">
              <div>
                <Label className="text-sm font-medium">Preview gratuito</Label>
                <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                  Permite assistir sem precisar comprar o curso
                </p>
              </div>
              <Switch checked={lesFreePreview} onCheckedChange={setLesFreePreview} />
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
              {lessonDialog.editId ? "Salvar Alterações" : "Criar Aula"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
