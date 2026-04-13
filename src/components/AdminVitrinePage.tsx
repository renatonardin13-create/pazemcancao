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
  Image,
  Eye,
  EyeOff,
  Layers,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Info,
  ImageIcon,
  Maximize2,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  listPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
} from "@/lib/admin-promo-banners.functions";

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

/* ── Summary Card ── */

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/8 border-emerald-500/15 text-emerald-400/60",
    gold: "bg-gold/8 border-gold/15 text-gold/60",
    amber: "bg-amber-500/8 border-amber-500/15 text-amber-400/60",
  };
  const cls = colorMap[color] || colorMap.gold;

  return (
    <div className="rounded-xl border border-border/15 bg-card/5 px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cls}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/35 font-medium">
          {label}
        </p>
        <p className="text-lg font-bold text-foreground/80 tabular-nums mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Page ── */

export default function AdminVitrinePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("shelves");
  const [showPreview, setShowPreview] = useState(true);

  // Shelf dialogs
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

  // Banner state
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerCourseId, setBannerCourseId] = useState("");
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerFit, setBannerFit] = useState<string>("cover");
  const [bannerAspect, setBannerAspect] = useState<string>("hero");
  const [bannerImgDims, setBannerImgDims] = useState<{ w: number; h: number } | null>(null);

  // Promo banner state
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [deletePromoTarget, setDeletePromoTarget] = useState<any>(null);
  const [promoTitle, setPromoTitle] = useState("");
  const [promoImageUrl, setPromoImageUrl] = useState("");
  const [promoLinkUrl, setPromoLinkUrl] = useState("");
  const [promoPosition, setPromoPosition] = useState(1);
  const [promoOrder, setPromoOrder] = useState(0);
  const [promoActive, setPromoActive] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-shelves"],
    queryFn: () => listShelves(),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-selector"],
    queryFn: () => listCoursesForSelector(),
  });

  const { data: promoBannersData } = useQuery({
    queryKey: ["admin-promo-banners"],
    queryFn: () => listPromoBanners(),
  });

  const shelves = data?.shelves ?? [];
  const courses = coursesData?.courses ?? [];
  const promoBanners = promoBannersData?.banners ?? [];
  const publishedCourses = courses.filter((c: any) => c.status === "published");
  const activeShelves = shelves.filter((s: any) => s.is_active);

  // Featured course for banner
  const featuredCourse = bannerCourseId
    ? courses.find((c: any) => c.id === bannerCourseId)
    : courses.find((c: any) => c.banner_image_url || c.cover_image_url);

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
      toast.success("Ordem atualizada!");
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

  // ── Promo banner mutations ──

  const createPromoMut = useMutation({
    mutationFn: (input: any) => createPromoBanner({ data: input }),
    onSuccess: () => {
      toast.success("Banner promo criado!");
      queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
      closePromoDialog();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updatePromoMut = useMutation({
    mutationFn: (input: any) => updatePromoBanner({ data: input }),
    onSuccess: () => {
      toast.success("Banner promo atualizado!");
      queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
      closePromoDialog();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deletePromoMut = useMutation({
    mutationFn: (id: string) => deletePromoBanner({ data: { id } }),
    onSuccess: () => {
      toast.success("Banner promo excluído!");
      queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
    },
    onError: (err: any) => toast.error(err.message),
  });


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

  // ── Promo dialog handlers ──

  const openCreatePromo = () => {
    setEditingPromo(null);
    setPromoTitle("");
    setPromoImageUrl("");
    setPromoLinkUrl("");
    setPromoPosition(1);
    setPromoOrder(promoBanners.length);
    setPromoActive(true);
    setPromoDialogOpen(true);
  };

  const openEditPromo = (banner: any) => {
    setEditingPromo(banner);
    setPromoTitle(banner.title);
    setPromoImageUrl(banner.image_url);
    setPromoLinkUrl(banner.link_url || "");
    setPromoPosition(banner.position_after_shelf);
    setPromoOrder(banner.sort_order);
    setPromoActive(banner.is_active);
    setPromoDialogOpen(true);
  };

  const closePromoDialog = () => {
    setPromoDialogOpen(false);
    setEditingPromo(null);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: promoTitle,
      image_url: promoImageUrl,
      link_url: promoLinkUrl || undefined,
      position_after_shelf: promoPosition,
      sort_order: promoOrder,
      is_active: promoActive,
    };
    if (editingPromo) {
      updatePromoMut.mutate({ id: editingPromo.id, ...payload });
    } else {
      createPromoMut.mutate(payload);
    }
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
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between pb-5 border-b border-border/10">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground/90 tracking-tight">
            Configuração da Vitrine
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/45 tracking-wide">
            Configure banner, cards e prateleiras da área do aluno
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-border/15 text-muted-foreground/50 hover:text-foreground/70 text-xs"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="h-3.5 w-3.5" />
          {showPreview ? "Esconder Preview" : "Mostrar Preview"}
        </Button>
      </div>

      {/* ── Summary Stats ── */}
      <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
        <p className="text-sm text-muted-foreground/50">
          Cursos Publicados:{" "}
          <strong className="text-gold font-bold">{publishedCourses.length}</strong>
        </p>
        <p className="text-sm text-muted-foreground/50">
          Prateleiras Ativas:{" "}
          <strong className="text-gold font-bold">{activeShelves.length}</strong>
        </p>
        <p className="text-sm text-muted-foreground/50">
          Banner Principal:{" "}
          <strong className={`font-bold ${featuredCourse ? "text-emerald-400" : "text-amber-400"}`}>
            {featuredCourse ? "Ativo" : "Inativo"}
          </strong>
        </p>
      </div>

      {/* ── Main content ── */}
      <div className={`flex gap-6 ${showPreview ? "" : ""}`}>
        {/* Left: tabs */}
        <div className={showPreview ? "flex-1 min-w-0" : "w-full"}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-card/5 border border-border/10 w-full justify-start gap-1 p-1.5 rounded-xl h-auto">
              <TabsTrigger
                value="banner"
                className="text-xs px-4 py-2 rounded-lg text-muted-foreground/50 data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm data-[state=active]:border-gold/20 data-[state=active]:border transition-all"
              >
                Banner Principal
              </TabsTrigger>
              <TabsTrigger
                value="cards"
                className="text-xs px-4 py-2 rounded-lg text-muted-foreground/50 data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm data-[state=active]:border-gold/20 data-[state=active]:border transition-all"
              >
                Cards
              </TabsTrigger>
              <TabsTrigger
                value="promo"
                className="text-xs px-4 py-2 rounded-lg text-muted-foreground/50 data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm data-[state=active]:border-gold/20 data-[state=active]:border transition-all"
              >
                Banners Promo
              </TabsTrigger>
              <TabsTrigger
                value="shelves"
                className="text-xs px-4 py-2 rounded-lg text-muted-foreground/50 data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-sm data-[state=active]:border-gold/20 data-[state=active]:border transition-all"
              >
                Prateleiras
              </TabsTrigger>
            </TabsList>

            {/* ── Banner Principal ── */}
            <TabsContent value="banner" className="mt-6 space-y-6">
              <div className="rounded-xl border border-border/15 bg-card/5 p-6 space-y-6">
                {/* Header */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground/70 mb-1">
                    Banner Principal (Hero da Home)
                  </h3>
                  <p className="text-[11px] text-muted-foreground/35">
                    O banner hero que aparece no topo da vitrine de cursos do aluno.
                  </p>
                </div>

                {/* Image specs info */}
                <div className="flex items-start gap-3 rounded-xl bg-gold/5 border border-gold/12 p-4">
                  <Info className="h-4 w-4 text-gold/50 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-foreground/60">
                      Requisitos da imagem
                    </p>
                    <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground/40">
                      <span>
                        Tamanho recomendado: <strong className="text-foreground/50">1920×500 px</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Formatos: <strong className="text-foreground/50">JPG, PNG, WebP</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle banner visibility */}
                <div className="flex items-center justify-between rounded-xl bg-card/5 border border-border/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground/70">
                      Exibir banner principal na vitrine
                    </p>
                    <p className="text-[11px] text-muted-foreground/40">
                      Quando desativado, o hero não será exibido na home do aluno
                    </p>
                  </div>
                  <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
                </div>

                {/* Image preview with real dimensions */}
                {(() => {
                  const imgSrc = bannerImageUrl || featuredCourse?.banner_image_url || featuredCourse?.cover_image_url;
                  const aspectClass = bannerAspect === "21:9" ? "aspect-[21/9]" : bannerAspect === "16:9" ? "aspect-[16/9]" : "aspect-[1920/500]";
                  const fitClass = bannerFit === "cover" ? "object-cover" : bannerFit === "contain" ? "object-contain" : "object-fill";
                  return (
                    <div className="space-y-2">
                      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground/40">
                        Preview do banner
                      </Label>
                      <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-border/10 bg-card/10`}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt="Banner preview"
                            className={`w-full h-full ${fitClass}`}
                            onLoad={(e) => {
                              const img = e.currentTarget;
                              setBannerImgDims({ w: img.naturalWidth, h: img.naturalHeight });
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-card/30 to-card/5 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                        <div className="absolute inset-0 flex items-end px-6 pb-6">
                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-gold/50 mb-1">Em destaque</p>
                            <p className="text-lg font-bold text-foreground/95 leading-tight">
                              {bannerTitle || featuredCourse?.title || "Título do curso"}
                            </p>
                            {(bannerSubtitle || featuredCourse?.short_description) && (
                              <p className="mt-1 text-[11px] text-muted-foreground/50 line-clamp-1">
                                {bannerSubtitle || featuredCourse?.short_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Image dimensions info */}
                      {bannerImgDims && (
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground/35">
                          <span>
                            Dimensões reais: <strong className="text-foreground/50">{bannerImgDims.w}×{bannerImgDims.h} px</strong>
                          </span>
                          <span>
                            Proporção: <strong className="text-foreground/50">{(bannerImgDims.w / bannerImgDims.h).toFixed(2)}:1</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Configuration fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Curso em destaque</Label>
                    <Select value={bannerCourseId} onValueChange={setBannerCourseId}>
                      <SelectTrigger className="bg-card/10 border-border/15">
                        <SelectValue placeholder="Automático — primeiro curso com banner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automático</SelectItem>
                        {courses.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground/30">
                      Curso exibido no hero da vitrine
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>URL do Banner (opcional)</Label>
                    <Input
                      value={bannerImageUrl}
                      onChange={(e) => {
                        setBannerImageUrl(e.target.value);
                        setBannerImgDims(null);
                      }}
                      placeholder="https://... imagem customizada"
                      className="bg-card/10 border-border/15"
                    />
                    <p className="text-[10px] text-muted-foreground/30">
                      Deixe vazio para usar o banner do curso selecionado
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título customizado (opcional)</Label>
                    <Input
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      placeholder="Deixe vazio para usar o título do curso"
                      className="bg-card/10 border-border/15"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtítulo (opcional)</Label>
                    <Input
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      placeholder="Deixe vazio para usar a descrição do curso"
                      className="bg-card/10 border-border/15"
                    />
                  </div>
                </div>

                {/* Display mode & aspect ratio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modo de exibição do banner</Label>
                    <Select value={bannerFit} onValueChange={setBannerFit}>
                      <SelectTrigger className="bg-card/10 border-border/15">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Preencher (pode cortar)</SelectItem>
                        <SelectItem value="contain">Conter (sem cortar)</SelectItem>
                        <SelectItem value="fill">Ajustar automaticamente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Proporção do container</Label>
                    <Select value={bannerAspect} onValueChange={setBannerAspect}>
                      <SelectTrigger className="bg-card/10 border-border/15">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="21:9">Ultra wide 21:9</SelectItem>
                        <SelectItem value="16:9">Wide 16:9</SelectItem>
                        <SelectItem value="hero">Hero padrão 1920×500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-destructive/20 text-destructive/60 hover:text-destructive hover:border-destructive/40"
                    onClick={() => {
                      setBannerImageUrl("");
                      setBannerImgDims(null);
                      toast.success("Banner removido");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover Banner
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-gold/20 text-gold/60 hover:text-gold hover:border-gold/30"
                    onClick={() => {
                      const url = prompt("Cole a URL da nova imagem do banner:");
                      if (url) {
                        setBannerImageUrl(url);
                        setBannerImgDims(null);
                        toast.success("Banner atualizado");
                      }
                    }}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Trocar Banner
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="cards" className="mt-6 space-y-6">
              <div className="rounded-xl border border-border/15 bg-card/5 p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground/70 mb-1">Cards de Curso</h3>
                  <p className="text-[11px] text-muted-foreground/35">
                    Configurações visuais dos cards exibidos nas prateleiras.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border/10 bg-card/3 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center">
                        <Image className="h-4 w-4 text-gold/50" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-foreground/70">Proporção 2:3</p>
                        <p className="text-[10px] text-muted-foreground/30">Vertical — estilo Netflix</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/25 leading-relaxed">
                      Cada curso usa sua <strong className="text-foreground/50">capa vertical</strong> (cover_image_url).
                      Recomendado: 1000×1500 px.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/10 bg-card/3 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-gold/50" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-foreground/70">Efeitos Hover</p>
                        <p className="text-[10px] text-muted-foreground/30">Zoom + glow dourado</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/25 leading-relaxed">
                      Os cards possuem animação de hover com zoom sutil e brilho dourado na borda,
                      criando uma experiência premium de streaming.
                    </p>
                  </div>
                </div>

                {/* Card preview grid */}
                <div>
                  <p className="text-[11px] text-muted-foreground/40 mb-3 uppercase tracking-wider font-medium">
                    Preview dos cards
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {(publishedCourses.length > 0 ? publishedCourses.slice(0, 5) : [{ id: "1", title: "Curso Exemplo", cover_image_url: null }]).map((course: any) => (
                      <div key={course.id} className="shrink-0 w-[120px]">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-border/10 bg-card/10">
                          {course.cover_image_url ? (
                            <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card/30 to-card/5">
                              <BookOpen className="h-6 w-6 text-muted-foreground/10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2.5">
                            <p className="text-[10px] font-bold text-white/90 line-clamp-2 leading-tight">
                              {course.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Banners Promo ── */}
            <TabsContent value="promo" className="mt-6 space-y-6">
              <div className="rounded-xl border border-border/15 bg-card/5 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/70 mb-1">Banners Promo</h3>
                    <p className="text-[11px] text-muted-foreground/35">
                      Campanhas, eventos e banners promocionais exibidos entre as prateleiras
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-gold/90 text-gold-foreground hover:bg-gold shadow-lg shadow-gold/20 font-semibold"
                    onClick={openCreatePromo}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>

                {/* Image specs info */}
                <div className="flex items-start gap-3 rounded-xl bg-gold/5 border border-gold/12 p-4">
                  <Info className="h-4 w-4 text-gold/50 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-foreground/60">
                      Requisitos da imagem
                    </p>
                    <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground/40">
                      <span>
                        Tamanho recomendado: <strong className="text-foreground/50">1200×400 px</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Formatos: <strong className="text-foreground/50">JPG, PNG, WebP</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* List or empty state */}
                {promoBanners.length === 0 ? (
                  <div className="text-center py-12 rounded-xl border border-dashed border-border/12 bg-card/3">
                    <div className="w-12 h-12 rounded-2xl bg-gold/8 border border-gold/15 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-6 w-6 text-gold/30" />
                    </div>
                    <p className="text-[13px] font-medium text-foreground/50 mb-1">
                      Nenhum banner secundário cadastrado
                    </p>
                    <p className="text-[11px] text-muted-foreground/30 max-w-xs mx-auto">
                      Adicione banners promocionais para a vitrine
                    </p>
                    <Button
                      size="sm"
                      className="mt-5 bg-gold/90 text-gold-foreground hover:bg-gold shadow-lg shadow-gold/20"
                      onClick={openCreatePromo}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Criar primeiro banner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {promoBanners.map((banner: any) => (
                      <div
                        key={banner.id}
                        className="flex items-center gap-4 rounded-xl border border-border/15 bg-card/8 px-5 py-3.5 transition-all hover:bg-card/12"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-[28px] rounded-lg overflow-hidden border border-border/10 bg-card/10 shrink-0">
                          {banner.image_url ? (
                            <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-card/20 to-card/5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-foreground/80 truncate">
                              {banner.title}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-[9px] rounded-full px-2 border font-medium ${
                                banner.is_active
                                  ? "text-emerald-400/80 border-emerald-500/25 bg-emerald-500/10"
                                  : "text-muted-foreground/40 border-border/15"
                              }`}
                            >
                              {banner.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[9px] rounded-full px-2 border text-muted-foreground/50 border-border/15"
                            >
                              Após prateleira {banner.position_after_shelf}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground/25 mt-0.5 truncate">
                            {banner.link_url ? `Link: ${banner.link_url}` : "Sem link"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground/25 hover:text-foreground/60"
                            onClick={() => openEditPromo(banner)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground/25 hover:text-destructive/60"
                            onClick={() => setDeletePromoTarget(banner)}
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Prateleiras ── */}
            <TabsContent value="shelves" className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground/70 tracking-tight">
                    Prateleiras (Shelves) da Vitrine
                  </h3>
                  <p className="text-[11px] text-muted-foreground/35 mt-0.5">
                    Organize os cursos em fileiras horizontais estilo Netflix
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 bg-gold/90 text-gold-foreground hover:bg-gold shadow-lg shadow-gold/20 font-semibold"
                  onClick={openCreate}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </div>

              {isLoading ? (
                <div className="py-16 text-center">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
                    Carregando prateleiras...
                  </p>
                </div>
              ) : shelves.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/12 bg-card/3 py-16 text-center">
                  <Layout className="mx-auto mb-4 h-8 w-8 text-muted-foreground/15" />
                  <p className="text-sm text-muted-foreground/35">
                    Nenhuma prateleira criada ainda.
                  </p>
                  <p className="text-[12px] text-muted-foreground/25 mt-1">
                    Crie prateleiras para organizar os cursos na vitrine do aluno.
                  </p>
                  <Button
                    size="sm"
                    className="mt-5 bg-gold/90 text-gold-foreground hover:bg-gold shadow-lg shadow-gold/20"
                    onClick={openCreate}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Criar primeira prateleira
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {shelves.map((shelf: any, idx: number) => {
                    const courseCount = shelf.shelf_courses?.length || 0;
                    return (
                      <div
                        key={shelf.id}
                        draggable
                        onDragStart={shelfDrag.handleDragStart(idx)}
                        onDragEnd={shelfDrag.handleDragEnd}
                        onDragOver={shelfDrag.handleDragOver(idx)}
                        className="flex items-center gap-4 rounded-xl border border-border/15 bg-card/8 px-5 py-3.5 transition-all hover:bg-card/12 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground/15 shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-foreground/80 truncate">
                              {shelf.name}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-[9px] rounded-full px-2 border font-medium ${
                                shelf.mode === "auto"
                                  ? "text-gold/60 border-gold/20 bg-gold/8"
                                  : "text-sky-400/70 border-sky-500/20 bg-sky-500/8"
                              }`}
                            >
                              {modeLabel(shelf.mode)}
                            </Badge>
                            {shelf.mode === "auto" && (
                              <Badge
                                variant="outline"
                                className="text-[9px] rounded-full px-2 border text-gold/50 border-gold/15 bg-gold/5"
                              >
                                {criteriaLabel(shelf.auto_criteria)}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="text-[9px] rounded-full px-2 border text-muted-foreground/50 border-border/15"
                            >
                              {courseCount} curso{courseCount !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground/25 mt-0.5">
                            {shelf.mode === "manual"
                              ? `${courseCount} curso(s) vinculado(s)`
                              : `Preenchimento automático: ${criteriaLabel(shelf.auto_criteria)}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={shelf.is_active}
                            onCheckedChange={(checked) => {
                              updateMut.mutate({ id: shelf.id, is_active: checked });
                            }}
                            className="scale-75"
                          />
                          {shelf.mode === "manual" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground/25 hover:text-gold/60"
                              onClick={() => openCourses(shelf)}
                              title="Gerenciar cursos"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground/25 hover:text-foreground/60"
                            onClick={() => openEdit(shelf)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground/25 hover:text-destructive/60"
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Preview panel */}
        {showPreview && (
          <div className="w-[340px] shrink-0 hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground/40" />
                  <span className="text-[12px] font-semibold text-foreground/60">
                    Pré-visualização
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider text-emerald-400/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                    Ao vivo
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] text-muted-foreground/30 hover:text-foreground/60"
                  onClick={() => setShowPreview(false)}
                >
                  <EyeOff className="h-3 w-3 mr-1" />
                  Esconder
                </Button>
              </div>

              {/* Mini preview */}
              <div className="rounded-xl border border-border/15 bg-background/50 overflow-hidden">
                {/* Mini banner */}
                {bannerEnabled && (
                <div className={`relative w-full ${bannerAspect === "21:9" ? "aspect-[21/9]" : bannerAspect === "16:9" ? "aspect-[16/9]" : "aspect-[1920/500]"} bg-card/10`}>
                  {featuredCourse && (bannerImageUrl || featuredCourse.banner_image_url || featuredCourse.cover_image_url) ? (
                    <img
                      src={bannerImageUrl || featuredCourse.banner_image_url || featuredCourse.cover_image_url || undefined}
                      alt=""
                      className={`w-full h-full ${bannerFit === "cover" ? "object-cover" : bannerFit === "contain" ? "object-contain" : "object-fill"}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-card/20 to-card/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-gold/40">Em destaque</p>
                    <p className="text-[10px] font-bold text-foreground/80 leading-tight mt-0.5 line-clamp-1">
                      {bannerTitle || featuredCourse?.title || "Banner Principal"}
                    </p>
                  </div>
                </div>
                )}

                {/* Mini shelves */}
                <div className="p-3 space-y-3">
                  {activeShelves.length === 0 ? (
                    <p className="text-[9px] text-muted-foreground/25 text-center py-4">
                      Nenhuma prateleira ativa
                    </p>
                  ) : (
                    activeShelves.slice(0, 3).map((shelf: any) => {
                      const shelfCourses = (shelf.shelf_courses || [])
                        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                        .map((sc: any) => sc.courses)
                        .filter(Boolean);
                      return (
                        <div key={shelf.id}>
                          <p className="text-[9px] font-bold text-foreground/50 mb-1.5 truncate">
                            {shelf.name}
                          </p>
                          <div className="flex gap-1.5 overflow-hidden">
                            {shelfCourses.length > 0 ? (
                              shelfCourses.slice(0, 4).map((c: any) => (
                                <div key={c.id} className="shrink-0 w-[48px]">
                                  <div className="aspect-[2/3] rounded-md overflow-hidden border border-border/8 bg-card/10">
                                    {c.cover_image_url ? (
                                      <img src={c.cover_image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-card/20 to-card/5" />
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <>
                                {[1, 2, 3, 4].map((i) => (
                                  <div key={i} className="shrink-0 w-[48px]">
                                    <div className="aspect-[2/3] rounded-md border border-border/6 bg-card/5" />
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {activeShelves.length > 3 && (
                    <p className="text-[9px] text-muted-foreground/20 text-center">
                      +{activeShelves.length - 3} prateleira(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Link to student area */}
              <a
                href="/cursos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-border/10 bg-card/5 text-[11px] text-muted-foreground/40 hover:text-gold/60 hover:border-gold/15 transition-all"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir vitrine do aluno
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Show preview button when hidden */}
      {!showPreview && (
        <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-gold/20 text-gold/60 hover:text-gold hover:border-gold/30 bg-background/90 backdrop-blur-sm shadow-lg"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-3.5 w-3.5" />
            Mostrar Preview
          </Button>
        </div>
      )}

      {/* ── Create/Edit Dialog ── */}
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
                className="bg-card/10 border-border/15"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-card/5 border border-border/10 px-4 py-3">
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
                <SelectTrigger className="bg-card/10 border-border/15">
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
                  <SelectTrigger className="bg-card/10 border-border/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="best_selling">Mais liberados</SelectItem>
                    <SelectItem value="featured">Em destaque</SelectItem>
                    <SelectItem value="enrolled">Cursos liberados do aluno</SelectItem>
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
                className="bg-card/10 border-border/15"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gold/90 text-gold-foreground hover:bg-gold font-semibold"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {(createMut.isPending || updateMut.isPending) && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              {editingShelf ? "Salvar" : "Criar Prateleira"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Courses Dialog ── */}
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
                <div className="rounded-xl border border-border/10 bg-card/5 divide-y divide-border/5">
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
                        className="flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing hover:bg-card/10 transition-colors"
                      >
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/15 shrink-0" />
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
                        <span className="text-[12px] font-medium text-foreground/70 truncate flex-1">
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
                <div className="rounded-xl border border-border/10 bg-card/5 max-h-48 overflow-y-auto divide-y divide-border/5">
                  {courses
                    .filter((c: any) => !selectedCourseIds.includes(c.id))
                    .map((course: any) => (
                      <label
                        key={course.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-card/10"
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
                        <span className="text-[12px] font-medium text-foreground/70 truncate flex-1">
                          {course.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] shrink-0 rounded-full px-2 border ${
                            course.status === "published"
                              ? "text-emerald-400/70 border-emerald-500/20 bg-emerald-500/8"
                              : "text-muted-foreground/40 border-border/15"
                          }`}
                        >
                          {course.status === "published" ? "Publicado" : "Rascunho"}
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
              className="w-full bg-gold/90 text-gold-foreground hover:bg-gold font-semibold"
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
              {setCoursesMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : null}
              {setCoursesMut.isPending ? "Salvando..." : "Salvar Cursos"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
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

      {/* ── Promo Create/Edit Dialog ── */}
      <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingPromo ? "Editar Banner Promo" : "Novo Banner Promo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePromoSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Título interno</Label>
              <Input
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="Ex: Black Friday 2026"
                required
                className="bg-card/10 border-border/15"
              />
            </div>

            <div className="space-y-2">
              <Label>URL da imagem</Label>
              <Input
                value={promoImageUrl}
                onChange={(e) => setPromoImageUrl(e.target.value)}
                placeholder="https://... imagem 1200x400"
                required
                className="bg-card/10 border-border/15"
              />
              <p className="text-[10px] text-muted-foreground/30">
                Recomendado: 1200×400 px — JPG, PNG ou WebP
              </p>
            </div>

            {promoImageUrl && (
              <div className="rounded-xl overflow-hidden border border-border/10 aspect-[3/1] bg-card/10">
                <img src={promoImageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Link (opcional)</Label>
              <Input
                value={promoLinkUrl}
                onChange={(e) => setPromoLinkUrl(e.target.value)}
                placeholder="https://..."
                className="bg-card/10 border-border/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posição (após prateleira nº)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={promoPosition}
                  onChange={(e) => setPromoPosition(Number(e.target.value))}
                  className="bg-card/10 border-border/15"
                />
              </div>
              <div className="space-y-2">
                <Label>Ordem de exibição</Label>
                <Input
                  type="number"
                  min={0}
                  max={999}
                  value={promoOrder}
                  onChange={(e) => setPromoOrder(Number(e.target.value))}
                  className="bg-card/10 border-border/15"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-card/5 border border-border/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground/70">Ativo</p>
                <p className="text-[11px] text-muted-foreground/40">Visível na vitrine</p>
              </div>
              <Switch checked={promoActive} onCheckedChange={setPromoActive} />
            </div>

            <Button
              type="submit"
              className="w-full bg-gold/90 text-gold-foreground hover:bg-gold font-semibold"
              disabled={createPromoMut.isPending || updatePromoMut.isPending}
            >
              {(createPromoMut.isPending || updatePromoMut.isPending) && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              {editingPromo ? "Salvar" : "Criar Banner"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Promo Delete Confirm ── */}
      <AlertDialog
        open={!!deletePromoTarget}
        onOpenChange={(v) => {
          if (!v) setDeletePromoTarget(null);
        }}
      >
        <AlertDialogContent className="bg-card border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground/85">
              Excluir banner promo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/50">
              Tem certeza que deseja excluir o banner{" "}
              <span className="font-semibold text-foreground/70">
                {deletePromoTarget?.title}
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
                if (deletePromoTarget) deletePromoMut.mutate(deletePromoTarget.id);
                setDeletePromoTarget(null);
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
