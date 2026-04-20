import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastError } from "@/lib/toast-utils";
import {
  GalleryHorizontalEnd,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "@/components/ImageUploadField";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  listHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  duplicateHeroBanner,
  reorderHeroBanners,
  toggleHeroBannerActive,
  listCoursesForBannerSelector,
} from "@/lib/admin-hero-banners.functions";
import { HeroBanner } from "@/components/vitrine/HeroBanner";

export const Route = createFileRoute("/_authenticated/admin/hero-banners")({
  component: AdminHeroBannersPage,
});

type CtaType = "url" | "product" | "video";

// Converte ISO/UTC para o formato esperado por <input type="datetime-local">
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Status visual de agendamento de um banner
function getScheduleStatus(b: { schedule_start_at?: string | null; schedule_end_at?: string | null }) {
  const now = Date.now();
  const start = b.schedule_start_at ? new Date(b.schedule_start_at).getTime() : null;
  const end = b.schedule_end_at ? new Date(b.schedule_end_at).getTime() : null;
  if (start && start > now) return { label: "Agendado", tone: "scheduled" as const };
  if (end && end < now) return { label: "Expirado", tone: "expired" as const };
  if (start || end) return { label: "Em campanha", tone: "live" as const };
  return null;
}

type FormState = {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  image_tablet_url: string;
  image_mobile_url: string;
  primary_cta_label: string;
  primary_cta_type: CtaType;
  primary_cta_target: string;
  secondary_cta_label: string;
  secondary_cta_type: CtaType;
  secondary_cta_target: string;
  banner_clickable: boolean;
  banner_click_type: CtaType;
  banner_click_target: string;
  autoplay: boolean;
  autoplay_interval_ms: number;
  is_active: boolean;
  sort_order: number;
  schedule_start_at: string;
  schedule_end_at: string;
};

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  image_tablet_url: "",
  image_mobile_url: "",
  primary_cta_label: "",
  primary_cta_type: "url",
  primary_cta_target: "",
  secondary_cta_label: "",
  secondary_cta_type: "url",
  secondary_cta_target: "",
  banner_clickable: false,
  banner_click_type: "url",
  banner_click_target: "",
  autoplay: true,
  autoplay_interval_ms: 7000,
  is_active: true,
  sort_order: 0,
  schedule_start_at: "",
  schedule_end_at: "",
};

function AdminHeroBannersPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: () => listHeroBanners(),
  });
  const { data: coursesData } = useQuery({
    queryKey: ["admin-banner-courses"],
    queryFn: () => listCoursesForBannerSelector(),
  });

  const banners = data?.banners ?? [];
  const courses = coursesData?.courses ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-hero-banners"] });
    qc.invalidateQueries({ queryKey: ["student-vitrine"] });
  };

  const createMut = useMutation({
    mutationFn: (data: any) => createHeroBanner({ data }),
    onSuccess: () => {
      toast.success("Banner criado!");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: any) => toastError(e),
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => updateHeroBanner({ data }),
    onSuccess: () => {
      toast.success("Banner atualizado!");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: any) => toastError(e),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteHeroBanner({ data: { id } }),
    onSuccess: () => {
      toast.success("Banner excluído!");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (e: any) => toastError(e),
  });

  const duplicateMut = useMutation({
    mutationFn: (id: string) => duplicateHeroBanner({ data: { id } }),
    onSuccess: () => {
      toast.success("Banner duplicado!");
      invalidate();
    },
    onError: (e: any) => toastError(e),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      toggleHeroBannerActive({ data: { id, is_active } }),
    onSuccess: () => invalidate(),
    onError: (e: any) => toastError(e),
  });

  const reorderMut = useMutation({
    mutationFn: (orderedIds: string[]) => reorderHeroBanners({ data: { orderedIds } }),
    onSuccess: () => invalidate(),
    onError: (e: any) => toastError(e),
  });

  const openCreate = () => {
    setForm({ ...emptyForm, sort_order: banners.length });
    setDialogOpen(true);
  };

  const openEdit = (b: any) => {
    setForm({
      id: b.id,
      title: b.title || "",
      subtitle: b.subtitle || "",
      description: b.description || "",
      image_url: b.image_url || "",
      image_tablet_url: b.image_tablet_url || "",
      image_mobile_url: b.image_mobile_url || "",
      primary_cta_label: b.primary_cta_label || "",
      primary_cta_type: (b.primary_cta_type || "url") as CtaType,
      primary_cta_target: b.primary_cta_target || b.primary_cta_url || "",
      secondary_cta_label: b.secondary_cta_label || "",
      secondary_cta_type: (b.secondary_cta_type || "url") as CtaType,
      secondary_cta_target: b.secondary_cta_target || b.secondary_cta_url || "",
      banner_clickable: !!b.banner_clickable,
      banner_click_type: (b.banner_click_type || "url") as CtaType,
      banner_click_target: b.banner_click_target || "",
      autoplay: b.autoplay !== false,
      autoplay_interval_ms: Number(b.autoplay_interval_ms) || 7000,
      is_active: b.is_active !== false,
      sort_order: b.sort_order ?? 0,
      schedule_start_at: b.schedule_start_at ? toLocalInput(b.schedule_start_at) : "",
      schedule_end_at: b.schedule_end_at ? toLocalInput(b.schedule_end_at) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.image_url) {
      toast.error("Adicione a imagem principal do banner.");
      return;
    }
    // Sincroniza target -> url quando type=url
    const payload: any = { ...form };
    if (form.primary_cta_type === "url") payload.primary_cta_url = form.primary_cta_target;
    if (form.secondary_cta_type === "url") payload.secondary_cta_url = form.secondary_cta_target;

    if (form.id) updateMut.mutate(payload);
    else createMut.mutate(payload);
  };

  const moveBanner = (idx: number, dir: -1 | 1) => {
    const next = [...banners];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    reorderMut.mutate(next.map((b: any) => b.id));
  };

  const previewList = useMemo(() => (previewOpen ? [previewOpen] : []), [previewOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = banners.findIndex((b: any) => b.id === active.id);
    const newIndex = banners.findIndex((b: any) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(banners, oldIndex, newIndex);
    reorderMut.mutate(next.map((b: any) => b.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
            <GalleryHorizontalEnd className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground/90">
              Banners da Home
            </h1>
            <p className="text-xs text-muted-foreground/60">
              Carrossel principal exibido no topo da vitrine.
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-gold text-black hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo banner
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground/60">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-xl border border-border/30 bg-card/20 p-10 text-center">
          <GalleryHorizontalEnd className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground/70">
            Nenhum banner cadastrado. Crie o primeiro para aparecer na vitrine.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={banners.map((b: any) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {banners.map((b: any, idx: number) => (
                <SortableBannerRow
                  key={b.id}
                  banner={b}
                  idx={idx}
                  total={banners.length}
                  onMove={moveBanner}
                  onPreview={() => setPreviewOpen(b)}
                  onToggle={() => toggleMut.mutate({ id: b.id, is_active: !b.is_active })}
                  onDuplicate={() => duplicateMut.mutate(b.id)}
                  onEdit={() => openEdit(b)}
                  onDelete={() => setDeleteTarget(b)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Dialog de criação/edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar banner" : "Novo banner"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Curso completo de louvor"
                />
              </div>
              <div>
                <Label>Subtítulo (etiqueta)</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Ex: NOVIDADE"
                />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Texto curto que aparece abaixo do título"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ImageUploadField
                label="Imagem desktop *"
                hint="Recomendado 1600x600 (3:1)"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="hero-banners"
                aspectClass="aspect-[3/1]"
                expectedRatio="3:1"
                recommendedSize="1600x600"
              />
              <ImageUploadField
                label="Imagem tablet"
                hint="Opcional, ~1024x500"
                value={form.image_tablet_url}
                onChange={(url) => setForm({ ...form, image_tablet_url: url })}
                folder="hero-banners"
                aspectClass="aspect-[2/1]"
              />
              <ImageUploadField
                label="Imagem mobile"
                hint="Opcional, ~750x900"
                value={form.image_mobile_url}
                onChange={(url) => setForm({ ...form, image_mobile_url: url })}
                folder="hero-banners"
                aspectClass="aspect-[5/6]"
              />
            </div>

            {/* CTA primário */}
            <CtaEditor
              title="Botão primário"
              label={form.primary_cta_label}
              type={form.primary_cta_type}
              target={form.primary_cta_target}
              courses={courses}
              onChange={(p) =>
                setForm({
                  ...form,
                  primary_cta_label: p.label,
                  primary_cta_type: p.type,
                  primary_cta_target: p.target,
                })
              }
            />

            {/* CTA secundário */}
            <CtaEditor
              title="Botão secundário"
              label={form.secondary_cta_label}
              type={form.secondary_cta_type}
              target={form.secondary_cta_target}
              courses={courses}
              onChange={(p) =>
                setForm({
                  ...form,
                  secondary_cta_label: p.label,
                  secondary_cta_type: p.type,
                  secondary_cta_target: p.target,
                })
              }
            />

            {/* Banner clicável */}
            <div className="rounded-lg border border-border/30 bg-card/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground/90">
                    Banner inteiro clicável
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Os botões continuam funcionando normalmente.
                  </p>
                </div>
                <Switch
                  checked={form.banner_clickable}
                  onCheckedChange={(v) => setForm({ ...form, banner_clickable: v })}
                />
              </div>
              {form.banner_clickable && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Tipo de ação</Label>
                    <Select
                      value={form.banner_click_type}
                      onValueChange={(v: CtaType) =>
                        setForm({ ...form, banner_click_type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">URL (interna ou externa)</SelectItem>
                        <SelectItem value="product">Página de produto</SelectItem>
                        <SelectItem value="video">Vídeo (modal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>
                      {form.banner_click_type === "product"
                        ? "Curso/produto"
                        : form.banner_click_type === "video"
                        ? "URL do vídeo (YouTube ou .mp4)"
                        : "Link"}
                    </Label>
                    {form.banner_click_type === "product" ? (
                      <Select
                        value={form.banner_click_target}
                        onValueChange={(v) => setForm({ ...form, banner_click_target: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={form.banner_click_target}
                        onChange={(e) =>
                          setForm({ ...form, banner_click_target: e.target.value })
                        }
                        placeholder={
                          form.banner_click_type === "video"
                            ? "https://youtube.com/..."
                            : "/cursos ou https://..."
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Autoplay e estado */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/30 bg-card/30 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Autoplay</p>
                  <p className="text-xs text-muted-foreground/60">Rotaciona slides</p>
                </div>
                <Switch
                  checked={form.autoplay}
                  onCheckedChange={(v) => setForm({ ...form, autoplay: v })}
                />
              </div>
              <div>
                <Label>Intervalo (ms)</Label>
                <Input
                  type="number"
                  min={2000}
                  max={60000}
                  step={500}
                  value={form.autoplay_interval_ms}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      autoplay_interval_ms: Number(e.target.value) || 7000,
                    })
                  }
                />
              </div>
              <div className="rounded-lg border border-border/30 bg-card/30 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Ativo</p>
                  <p className="text-xs text-muted-foreground/60">Exibir na vitrine</p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
            </div>

            {/* Agendamento de campanha */}
            <div className="rounded-lg border border-border/30 bg-card/30 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground/90">
                  Agendamento de exibição
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Defina quando o banner deve aparecer (ideal para campanhas sazonais).
                  Deixe em branco para exibir sempre que estiver ativo.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Início</Label>
                  <Input
                    type="datetime-local"
                    value={form.schedule_start_at}
                    onChange={(e) =>
                      setForm({ ...form, schedule_start_at: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Fim</Label>
                  <Input
                    type="datetime-local"
                    value={form.schedule_end_at}
                    onChange={(e) =>
                      setForm({ ...form, schedule_end_at: e.target.value })
                    }
                  />
                </div>
              </div>
              {form.schedule_start_at &&
                form.schedule_end_at &&
                new Date(form.schedule_end_at) <= new Date(form.schedule_start_at) && (
                  <p className="text-xs text-destructive">
                    A data de fim deve ser posterior à data de início.
                  </p>
                )}
            </div>
          </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border/30 pt-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
              className="bg-gold text-black hover:bg-gold/90"
            >
              {(createMut.isPending || updateMut.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {form.id ? "Salvar alterações" : "Criar banner"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O banner "{deleteTarget?.title}" será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewOpen(null)}
        >
          <button
            onClick={() => setPreviewOpen(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <HeroBanner banners={previewList} />
          </div>
        </div>
      )}
    </div>
  );
}

function CtaEditor({
  title,
  label,
  type,
  target,
  courses,
  onChange,
}: {
  title: string;
  label: string;
  type: CtaType;
  target: string;
  courses: any[];
  onChange: (p: { label: string; type: CtaType; target: string }) => void;
}) {
  return (
    <div className="rounded-lg border border-border/30 bg-card/30 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground/90">{title}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label>Texto do botão</Label>
          <Input
            value={label}
            onChange={(e) => onChange({ label: e.target.value, type, target })}
            placeholder="Ex: Quero conhecer"
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <Select
            value={type}
            onValueChange={(v: CtaType) => onChange({ label, type: v, target: "" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="product">Produto interno</SelectItem>
              <SelectItem value="video">Vídeo (modal)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>
            {type === "product"
              ? "Curso"
              : type === "video"
              ? "URL do vídeo"
              : "URL"}
          </Label>
          {type === "product" ? (
            <Select
              value={target}
              onValueChange={(v) => onChange({ label, type, target: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={target}
              onChange={(e) => onChange({ label, type, target: e.target.value })}
              placeholder={type === "video" ? "https://youtube.com/..." : "/cursos ou https://..."}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SortableBannerRow({
  banner: b,
  idx,
  total,
  onMove,
  onPreview,
  onToggle,
  onDuplicate,
  onEdit,
  onDelete,
}: {
  banner: any;
  idx: number;
  total: number;
  onMove: (idx: number, dir: -1 | 1) => void;
  onPreview: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: b.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-xl border border-border/30 bg-card/20 p-3 transition hover:border-gold/30"
    >
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => onMove(idx, -1)}
          disabled={idx === 0}
          className="rounded p-1 text-muted-foreground/50 hover:text-gold disabled:opacity-20"
          title="Mover para cima"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-1 text-muted-foreground/40 hover:text-gold active:cursor-grabbing"
          title="Arrastar para reordenar"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMove(idx, 1)}
          disabled={idx === total - 1}
          className="rounded p-1 text-muted-foreground/50 hover:text-gold disabled:opacity-20"
          title="Mover para baixo"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
        {b.image_url ? (
          <img src={b.image_url} alt={b.title} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground/90">
            {b.title || "(sem título)"}
          </p>
          {b.is_active ? (
            <Badge className="bg-emerald-500/15 text-emerald-400">Ativo</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground/60">
              Inativo
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground/60">
          {b.subtitle || b.description || "Sem descrição"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onPreview} title="Pré-visualizar">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onToggle} title={b.is_active ? "Desativar" : "Ativar"}>
          {b.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDuplicate} title="Duplicar">
          <Copy className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onEdit} title="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          title="Excluir"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
