import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback, useEffect } from "react";
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
  Info,
  ImageIcon,
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
import { getPlatformSettings, updatePlatformSetting } from "@/lib/platform-settings.functions";

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
  const [bannerAspect, setBannerAspect] = useState<string>("auto");
  const [bannerImgDims, setBannerImgDims] = useState<{ w: number; h: number } | null>(null);

  // Promo banner state
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [deletePromoTarget, setDeletePromoTarget] = useState<any>(null);
  const [promoTitle, setPromoTitle] = useState("");
  const [promoImageUrl, setPromoImageUrl] = useState("");
  const [promoLinkUrl, setPromoLinkUrl] = useState("");
  const [promoPosition, setPromoPosition] = useState("before");
  const [promoType, setPromoType] = useState("static");
  const [promoOrder, setPromoOrder] = useState(0);
  const [promoActive, setPromoActive] = useState(true);
  const [promoSchedule, setPromoSchedule] = useState(false);
  const [promoShowVitrine, setPromoShowVitrine] = useState(true);
  const [promoShowCommunity, setPromoShowCommunity] = useState(false);

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

  // Load banner settings from platform_settings
  const { data: settingsData } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => getPlatformSettings(),
  });

  // Hydrate banner state from saved settings
  const bannerSettingsLoaded = useRef(false);
  if (settingsData?.settings?.hero_banner && !bannerSettingsLoaded.current) {
    const saved = settingsData.settings.hero_banner;
    bannerSettingsLoaded.current = true;
    // Use setTimeout to avoid setting state during render
    setTimeout(() => {
      if (saved.enabled !== undefined) setBannerEnabled(saved.enabled);
      if (saved.title) setBannerTitle(saved.title);
      if (saved.subtitle) setBannerSubtitle(saved.subtitle);
      if (saved.image_url) setBannerImageUrl(saved.image_url);
      if (saved.course_id) setBannerCourseId(saved.course_id);
      if (saved.fit) setBannerFit(saved.fit);
      if (saved.aspect) setBannerAspect(saved.aspect);
    }, 0);
  }

  const shelves = data?.shelves ?? [];
  const courses = coursesData?.courses ?? [];
  const promoBanners = promoBannersData?.banners ?? [];
  const publishedCourses = courses.filter((c: any) => c.status === "published");
  const activeShelves = shelves.filter((s: any) => s.is_active);

  // Featured course for banner
  const featuredCourse = bannerCourseId
    ? courses.find((c: any) => c.id === bannerCourseId)
    : courses.find((c: any) => c.banner_image_url || c.cover_image_url);

  // Save banner config mutation
  const saveBannerMut = useMutation({
    mutationFn: () => updatePlatformSetting({
      data: {
        key: 'hero_banner',
        value: {
          enabled: bannerEnabled,
          title: bannerTitle,
          subtitle: bannerSubtitle,
          image_url: bannerImageUrl,
          course_id: bannerCourseId,
          fit: bannerFit,
          aspect: bannerAspect,
        },
      },
    }),
    onSuccess: () => {
      toast.success("Banner salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

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
    // Load existing courses for manual shelves
    if (shelf.mode === "manual") {
      const existing = (shelf.shelf_courses || [])
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((sc: any) => sc.course_id);
      setSelectedCourseIds(existing);
    } else {
      setSelectedCourseIds([]);
    }
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
    setPromoPosition("before");
    setPromoType("static");
    setPromoOrder(promoBanners.length);
    setPromoActive(true);
    setPromoSchedule(false);
    setPromoShowVitrine(true);
    setPromoShowCommunity(false);
    setPromoDialogOpen(true);
  };

  const openEditPromo = (banner: any) => {
    setEditingPromo(banner);
    setPromoTitle(banner.title);
    setPromoImageUrl(banner.image_url);
    setPromoLinkUrl(banner.link_url || "");
    setPromoPosition(String(banner.position_after_shelf) || "before");
    setPromoType("static");
    setPromoOrder(banner.sort_order);
    setPromoActive(banner.is_active);
    setPromoSchedule(false);
    setPromoShowVitrine(true);
    setPromoShowCommunity(false);
    setPromoDialogOpen(true);
  };

  const closePromoDialog = () => {
    setPromoDialogOpen(false);
    setEditingPromo(null);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const posMap: Record<string, number> = { before: 0, between: 1, after: 99 };
    const payload = {
      title: promoTitle,
      image_url: promoImageUrl,
      link_url: promoLinkUrl || undefined,
      position_after_shelf: posMap[promoPosition] ?? 1,
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
      <div className="pb-5 border-b border-border/10">
        <h1 className="font-display text-2xl font-bold text-foreground/90 tracking-tight">
          Configuração da Vitrine
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground/45 tracking-wide">
          Configure banner, cards e prateleiras da área do aluno
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Cursos Publicados"
          value={publishedCourses.length}
          icon={BookOpen}
          color="emerald"
        />
        <SummaryCard
          label="Prateleiras Ativas"
          value={activeShelves.length}
          icon={Layers}
          color="gold"
        />
        <SummaryCard
          label="Banner Principal"
          value={featuredCourse ? "Configurado" : "Não configurado"}
          icon={Image}
          color={featuredCourse ? "emerald" : "amber"}
        />
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
              <div className="space-y-5">
                {/* Header */}
                <div>
                  <h3 className="text-base font-bold text-foreground/85">
                    Banner Principal{" "}
                    <span className="font-normal text-muted-foreground/50">(Hero da Home)</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                    Tamanho recomendado: 1920×500px • Formatos: JPG, PNG, WebP
                  </p>
                </div>

                {/* Image preview */}
                {(() => {
                  const imgSrc = bannerImageUrl || featuredCourse?.banner_image_url || featuredCourse?.cover_image_url;
                  const aspectMap: Record<string, string> = {
                    auto: "",
                    "4:1": "aspect-[4/1]",
                    "3:1": "aspect-[3/1]",
                    "16:5": "aspect-[16/5]",
                    "21:9": "aspect-[21/9]",
                  };
                  const aspectClass = aspectMap[bannerAspect] || "";
                  const fitClass = bannerFit === "cover" ? "object-cover" : "object-contain";
                  return (
                    <div className="space-y-3">
                      <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-border/10 bg-card/10 ${!aspectClass ? "max-h-[400px]" : ""}`}>
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
                          <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-card/30 to-card/5 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/10" />
                          </div>
                        )}
                      </div>

                      {/* Dimensions info */}
                      {bannerImgDims && (
                        <p className="text-center text-[11px] text-muted-foreground/40">
                          Dimensões:{" "}
                          <strong className="text-foreground/60">{bannerImgDims.w} × {bannerImgDims.h}px</strong>
                          {"  "}(Proporção: {(bannerImgDims.w / bannerImgDims.h).toFixed(2)}:1)
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Display mode */}
                <div className="flex items-center justify-between rounded-xl bg-card/5 border border-border/10 px-4 py-3">
                  <Label className="text-sm text-foreground/60 font-medium">Modo de exibição do banner</Label>
                  <Select value={bannerFit} onValueChange={setBannerFit}>
                    <SelectTrigger className="w-[220px] bg-card/10 border-border/15">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Preencher (pode cortar)</SelectItem>
                      <SelectItem value="contain">Mostrar inteiro (sem corte)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Aspect ratio */}
                <div className="flex items-center justify-between rounded-xl bg-card/5 border border-border/10 px-4 py-3">
                  <Label className="text-sm text-foreground/60 font-medium">Proporção do container</Label>
                  <Select value={bannerAspect} onValueChange={setBannerAspect}>
                    <SelectTrigger className="w-[220px] bg-card/10 border-border/15">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automático (da imagem)</SelectItem>
                      <SelectItem value="4:1">Widescreen 4:1</SelectItem>
                      <SelectItem value="3:1">Ultra-wide 3:1</SelectItem>
                      <SelectItem value="16:5">Cinema 16:5</SelectItem>
                      <SelectItem value="21:9">Ultrawide 21:9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggle visibility */}
                <div className="flex items-center justify-between rounded-xl bg-card/5 border border-border/10 px-4 py-3">
                  <p className="text-sm font-medium text-foreground/60">
                    Exibir banner principal na vitrine
                  </p>
                  <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
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

                {/* Save button */}
                <Button
                  size="sm"
                  className="gap-1.5 bg-gold/80 text-gold-foreground hover:bg-gold"
                  onClick={() => saveBannerMut.mutate()}
                  disabled={saveBannerMut.isPending}
                >
                  {saveBannerMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Salvar Banner
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="cards" className="mt-6 space-y-6">
              <div className="space-y-5">
                {/* Header */}
                <div>
                  <h3 className="text-base font-bold text-foreground/85">
                    Configuração dos Cards{" "}
                    <span className="font-normal text-muted-foreground/50">(Netflix Style)</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                    Personalize a aparência dos cards de cursos nas prateleiras
                  </p>
                </div>

                {/* Toggle rows */}
                {[
                  { label: "Exibir título no card", key: "showTitle" },
                  { label: "Exibir descrição curta", key: "showDesc" },
                  { label: "Exibir categoria", key: "showCategory" },
                  { label: "Mostrar barra de progresso", key: "showProgress" },
                  { label: "Mostrar cadeado em cursos bloqueados", key: "showLock" },
                  { label: "Aplicar efeito hover dourado", key: "hoverGold" },
                  { label: "Mostrar borda nos cards", key: "showBorder" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl bg-card/5 border border-border/10 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-foreground/60">{item.label}</p>
                    <Switch defaultChecked={true} />
                  </div>
                ))}

                {/* Gradient intensity slider - cards */}
                <div className="rounded-xl bg-card/5 border border-border/10 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground/60">Intensidade do gradiente nos cards</p>
                    <span className="text-sm font-semibold text-gold/70">20%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="20"
                    className="w-full h-1.5 rounded-full appearance-none bg-muted/20 accent-gold cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground/30">
                    0% = sem escurecimento | 100% = escurecimento total
                  </p>
                </div>

                {/* Gradient intensity slider - banner */}
                <div className="rounded-xl bg-card/5 border border-border/10 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground/60">Intensidade do gradiente no banner principal</p>
                    <span className="text-sm font-semibold text-gold/70">20%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="20"
                    className="w-full h-1.5 rounded-full appearance-none bg-muted/20 accent-gold cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground/30">
                    Controla a opacidade do gradiente sobre o banner hero
                  </p>
                </div>

                {/* Cards per shelf limit */}
                <div className="space-y-2">
                  <Label className="text-sm text-foreground/60 font-medium">
                    Limite global de cards por prateleira
                  </Label>
                  <Input
                    type="number"
                    defaultValue={20}
                    className="bg-card/10 border-border/15 max-w-[200px]"
                  />
                </div>

                {/* Save button */}
                <Button className="w-full gap-2 bg-gold/90 text-gold-foreground hover:bg-gold shadow-lg shadow-gold/20 font-semibold">
                  <BookOpen className="h-4 w-4" />
                  Salvar Configurações
                </Button>
              </div>
            </TabsContent>

            {/* ── Banners Promo ── */}
            <TabsContent value="promo" className="mt-6 space-y-6">
              <div className="space-y-5">
                {/* Header with button */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground/85">
                      Banners Promo{" "}
                      <span className="font-normal text-muted-foreground/50">Campanhas Eventos</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                      Tamanho recomendado: 1200×400px • Aparecem entre as prateleiras
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={openCreatePromo}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>

                {/* List or empty state */}
                {promoBanners.length === 0 ? (
                  <div className="text-center py-12 rounded-xl border border-dashed border-border/12 bg-card/3">
                    <div className="w-12 h-12 rounded-2xl bg-card/8 border border-border/15 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
                    </div>
                    <p className="text-[13px] font-medium text-foreground/50 mb-1">
                      Nenhum banner secundário cadastrado
                    </p>
                    <p className="text-[11px] text-muted-foreground/30 max-w-xs mx-auto">
                      Adicione banners promocionais para a vitrine
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {promoBanners.map((banner: any) => (
                      <div
                        key={banner.id}
                        className="flex items-center gap-4 rounded-xl border border-border/15 bg-card/8 px-5 py-3.5 transition-all hover:bg-card/12"
                      >
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
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground/85">
                    Prateleiras (Shelves){" "}
                    <span className="font-normal text-muted-foreground/50">da Vitrine</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                    Organize os cursos em fileiras horizontais estilo Netflix
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
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
                        className="flex items-center gap-4 rounded-xl border border-border/15 bg-card/8 px-4 py-3.5 transition-all hover:bg-card/12 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground/15 shrink-0" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground/80 uppercase tracking-wide truncate">
                            {shelf.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground/35 mt-0.5">
                            {modeLabel(shelf.mode)}
                            {shelf.mode === "auto" && ` — ${criteriaLabel(shelf.auto_criteria)}`}
                            {shelf.mode === "manual" && ` • ${courseCount} curso${courseCount !== 1 ? "s" : ""}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={shelf.is_active}
                            onCheckedChange={(checked) => {
                              updateMut.mutate({ id: shelf.id, is_active: checked });
                            }}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-border/15 text-muted-foreground/40 hover:text-foreground/60"
                            onClick={() => openEdit(shelf)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-border/15 text-muted-foreground/40 hover:text-destructive/60"
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

      {/* ── Create/Edit Shelf Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="px-6 pt-5 pb-3">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-foreground/85">
                {editingShelf ? "Editar Prateleira" : "Nova Prateleira"}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground/40">
                Configure uma prateleira de cursos para a vitrine
              </p>
            </DialogHeader>
          </div>

          <form
            onSubmit={(e) => {
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
                if (formMode === "manual") {
                  setCoursesMut.mutate({
                    shelfId: editingShelf.id,
                    courseIds: selectedCourseIds,
                  });
                }
              } else {
                createMut.mutate(payload);
              }
            }}
          >
            <div className="px-6 pb-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-foreground/60">Nome da Prateleira</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Lançamentos"
                  required
                  className="bg-card/10 border-border/15"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-foreground/60">Tipo</Label>
                <Select value={formMode} onValueChange={(v) => {
                  setFormMode(v);
                  if (v === "manual" && editingShelf) {
                    const existing = (editingShelf.shelf_courses || [])
                      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                      .map((sc: any) => sc.course_id);
                    setSelectedCourseIds(existing);
                  }
                }}>
                  <SelectTrigger className="bg-card/10 border-border/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual (selecionar cursos)</SelectItem>
                    <SelectItem value="auto">Automática (por critério)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formMode === "auto" && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-foreground/60">Critério</Label>
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

              {formMode === "manual" && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-foreground/60">Selecionar Cursos</Label>
                  <div className="rounded-xl border border-border/10 bg-card/5 max-h-[220px] overflow-y-auto divide-y divide-border/5">
                    {courses.map((course: any) => {
                      const isSelected = selectedCourseIds.includes(course.id);
                      return (
                        <div
                          key={course.id}
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-card/10"
                          onClick={() => toggleCourse(course.id)}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-gold bg-gold" : "border-muted-foreground/20"}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-gold-foreground" />}
                          </div>
                          <span className="text-[12px] font-medium text-foreground/70 truncate flex-1">
                            {course.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground/35">
                    {selectedCourseIds.length} curso(s) selecionado(s)
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground/60">Exibir na vitrine</span>
                <Switch checked={formActive} onCheckedChange={setFormActive} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="gap-1.5 bg-gold/90 text-gold-foreground hover:bg-gold font-semibold"
                disabled={createMut.isPending || updateMut.isPending}
              >
                {(createMut.isPending || updateMut.isPending) && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <BookOpen className="h-3.5 w-3.5" />
                Salvar
              </Button>
            </div>
          </form>
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
        <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-foreground/85">
                {editingPromo ? "Editar Banner Secundário" : "Novo Banner Secundário"}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground/40">Recomendado: 1200 × 400 px</p>
            </DialogHeader>
          </div>

          <form onSubmit={handlePromoSubmit}>
            <div className="flex divide-x divide-border/10">
              {/* Left column */}
              <div className="flex-1 px-6 pb-6 space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-foreground/60">Nome da Promoção (opcional)</Label>
                  <Input
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    placeholder="Ex: Black Friday 2024"
                    className="bg-card/10 border-border/15"
                  />
                </div>

                {/* Preview */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-foreground/60">Preview do Banner</Label>
                  <div
                    className="relative w-full aspect-[3/1] rounded-xl border-2 border-dashed border-border/15 bg-card/5 flex flex-col items-center justify-center cursor-pointer hover:border-gold/20 transition-colors overflow-hidden"
                    onClick={() => {
                      const url = prompt("Cole a URL da imagem do banner:");
                      if (url) setPromoImageUrl(url);
                    }}
                  >
                    {promoImageUrl ? (
                      <img src={promoImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-muted-foreground/15 mb-2" />
                        <span className="text-gold/50 text-[11px] font-medium">↑ Clique para upload</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="flex-1 px-6 pb-6 space-y-4">
                {/* Position & Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-foreground/60">Posição</Label>
                    <Select value={promoPosition} onValueChange={setPromoPosition}>
                      <SelectTrigger className="bg-card/10 border-border/15">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Antes das prateleiras</SelectItem>
                        <SelectItem value="between">Entre prateleiras</SelectItem>
                        <SelectItem value="after">Após prateleiras</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-foreground/60">Tipo</Label>
                    <Select value={promoType} onValueChange={setPromoType}>
                      <SelectTrigger className="bg-card/10 border-border/15">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="static">Estático</SelectItem>
                        <SelectItem value="carousel">Carrossel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Onde Exibir */}
                <div className="rounded-xl bg-card/5 border border-border/10 px-4 py-3 space-y-2">
                  <p className="text-[11px] font-semibold text-foreground/60">Onde Exibir</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch checked={promoShowVitrine} onCheckedChange={setPromoShowVitrine} />
                      <span className="text-xs text-foreground/60">Vitrine (Showcase)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={promoShowCommunity} onCheckedChange={setPromoShowCommunity} />
                      <span className="text-xs text-foreground/60">Comunidade</span>
                    </div>
                  </div>
                </div>

                {/* Agendamento */}
                <div className="flex items-center justify-between rounded-xl bg-card/5 border border-border/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground/60">Agendamento Automático</p>
                    <p className="text-[10px] text-muted-foreground/30">Ativar/desativar banner em datas específicas</p>
                  </div>
                  <Switch checked={promoSchedule} onCheckedChange={setPromoSchedule} />
                </div>

                {/* Ativar banner */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground/60">Ativar banner</span>
                  <Switch checked={promoActive} onCheckedChange={setPromoActive} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/10">
              <Button
                type="button"
                variant="outline"
                onClick={closePromoDialog}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="gap-1.5 bg-gold/90 text-gold-foreground hover:bg-gold font-semibold"
                disabled={createPromoMut.isPending || updatePromoMut.isPending}
              >
                {(createPromoMut.isPending || updatePromoMut.isPending) && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <BookOpen className="h-3.5 w-3.5" />
                Salvar
              </Button>
            </div>
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
