import { EmptyState } from "@/components/EmptyState";
import { toastError } from "@/lib/toast-utils";
import { ListSkeleton } from "@/components/LoadingSkeletons";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminContentItems,
  createContentItem,
  updateContentItem,
  deleteContentItem,
} from "@/lib/admin-content.functions";
import { listAdminCategories } from "@/lib/admin-categories.functions";
import { listAdminJourneys } from "@/lib/admin-journeys.functions";
import {
  BookOpen, Video, GraduationCap, FileText, Plus, Trash2,
  ToggleLeft, ToggleRight, Pencil, Loader2, ExternalLink,
} from "lucide-react";
import { AdminActionButtons } from "@/components/AdminActionButtons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageFieldHint } from "@/components/ImageFieldHint";

export const Route = createFileRoute("/_authenticated/admin/conteudos")({
  component: AdminContentPage,
});

const contentTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  ebook: { label: "E-book", icon: BookOpen, color: "text-blue-400/60 border-blue-500/15 bg-blue-500/8" },
  video: { label: "Videoaula", icon: Video, color: "text-purple-400/60 border-purple-500/15 bg-purple-500/8" },
  free_lesson: { label: "Aula Gratuita", icon: GraduationCap, color: "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8" },
  material: { label: "Material", icon: FileText, color: "text-amber-400/60 border-amber-500/15 bg-amber-500/8" },
};

// Category options are now loaded dynamically from DB

const accessModeOptions = [
  { value: "gratuito", label: "Gratuito" },
  { value: "pago", label: "Pago (acesso imediato)" },
  { value: "liberar_em_dias", label: "Liberar em X dias após compra" },
];

// Journey options are now loaded dynamically from DB

function AdminContentPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("ebook");
  const [videoUrl, setVideoUrl] = useState("");
  const [salesPageUrl, setSalesPageUrl] = useState("");
  const [accessMode, setAccessMode] = useState("pago");
  const [releaseDays, setReleaseDays] = useState<string>("");
  const [displayCategory, setDisplayCategory] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [showAsCard, setShowAsCard] = useState(true);
  const [sortOrder, setSortOrder] = useState<string>("");
  const [journeyGroup, setJourneyGroup] = useState("");
  const [journeyOrder, setJourneyOrder] = useState<string>("");
  const [unlockRuleType, setUnlockRuleType] = useState("none");
  const [unlockRuleContentId, setUnlockRuleContentId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredPriority, setFeaturedPriority] = useState<string>("");
  const [releaseMode, setReleaseMode] = useState("liberar_tudo");
  const [initialFreeCount, setInitialFreeCount] = useState<string>("");
  const [lockedFinalCount, setLockedFinalCount] = useState<string>("");
  const [lockedLabel, setLockedLabel] = useState("");
  const [launchMode, setLaunchMode] = useState("none");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: () => listAdminContentItems(),
    staleTime: 30_000,
  });

  const { data: catData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
    staleTime: 60_000,
  });

  const { data: journeyData } = useQuery({
    queryKey: ["admin-journeys"],
    queryFn: () => listAdminJourneys(),
    staleTime: 60_000,
  });

  const categoryOptions = useMemo(() => {
    const base = [{ value: "__none__", label: "Nenhuma (padrão por tipo)" }];
    if (catData?.categories) {
      for (const c of catData.categories) {
        base.push({ value: c.slug, label: `${c.icon || ''} ${c.name}`.trim() });
      }
    }
    return base;
  }, [catData]);

  const journeyOptions = useMemo(() => {
    const base = [{ value: "__none__", label: "Nenhuma trilha" }];
    if (journeyData?.journeys) {
      for (const j of journeyData.journeys as any[]) {
        base.push({ value: j.slug, label: `${j.icon || ''} ${j.name}`.trim() });
      }
    }
    return base;
  }, [journeyData]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContentType("ebook");
    setVideoUrl("");
    setSalesPageUrl("");
    setAccessMode("pago");
    setReleaseDays("");
    setDisplayCategory("");
    setBadgeText("");
    setShowAsCard(true);
    setSortOrder("");
    setJourneyGroup("");
    setJourneyOrder("");
    setUnlockRuleType("none");
    setUnlockRuleContentId("");
    setIsFeatured(false);
    setFeaturedPriority("");
    setReleaseMode("liberar_tudo");
    setInitialFreeCount("");
    setLockedFinalCount("");
    setLockedLabel("");
    setLaunchMode("none");
    setCoverFile(null);
    setContentFile(null);
    setEditItem(null);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setContentType(item.content_type);
    setVideoUrl(item.video_url || "");
    setSalesPageUrl(item.sales_page_url || "");
    setAccessMode(item.access_mode || (item.is_free ? "gratuito" : "pago"));
    setReleaseDays(item.release_days != null ? String(item.release_days) : "");
    setDisplayCategory(item.display_category || "");
    setBadgeText(item.badge_text || "");
    setShowAsCard(item.show_as_card !== false);
    setSortOrder(item.sort_order != null ? String(item.sort_order) : "");
    setJourneyGroup(item.journey_group || "");
    setJourneyOrder(item.journey_order != null ? String(item.journey_order) : "");
    setUnlockRuleType(item.unlock_rule_type || "none");
    setUnlockRuleContentId(item.unlock_rule_content_id || "");
    setIsFeatured(item.is_featured || false);
    setFeaturedPriority(item.featured_priority != null ? String(item.featured_priority) : "");
    setReleaseMode(item.release_mode || "liberar_tudo");
    setInitialFreeCount(item.initial_free_count != null ? String(item.initial_free_count) : "");
    setLockedFinalCount(item.locked_final_count != null ? String(item.locked_final_count) : "");
    setLockedLabel(item.locked_label || "");
    setLaunchMode(item.launch_mode || "none");
    setCoverFile(null);
    setContentFile(null);
    setFormOpen(true);
  };

  const openNew = () => {
    resetForm();
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let cover_url = editItem?.cover_url || undefined;
      let file_url = editItem?.file_url || undefined;

      const itemId = editItem?.id || crypto.randomUUID();

      if (coverFile) {
        const path = `covers/${itemId}.${coverFile.name.split('.').pop()}`;
        const { error } = await supabase.storage.from("content-files").upload(path, coverFile, { upsert: true });
        if (error) throw new Error("Erro no upload da capa: " + error.message);
        const { data: urlData } = supabase.storage.from("content-files").getPublicUrl(path);
        cover_url = urlData.publicUrl + "?t=" + Date.now();
      }

      if (contentFile) {
        const path = `files/${itemId}.${contentFile.name.split('.').pop()}`;
        const { error } = await supabase.storage.from("content-files").upload(path, contentFile, { upsert: true });
        if (error) throw new Error("Erro no upload do arquivo: " + error.message);
        const { data: urlData } = supabase.storage.from("content-files").getPublicUrl(path);
        file_url = urlData.publicUrl + "?t=" + Date.now();
      }

      const parsedDays = releaseDays.trim() !== "" ? parseInt(releaseDays, 10) : null;
      const parsedSortOrder = sortOrder.trim() !== "" ? parseInt(sortOrder, 10) : undefined;
      const isFree = accessMode === "gratuito";

      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        content_type: contentType,
        cover_url,
        file_url,
        video_url: videoUrl.trim() || undefined,
        sales_page_url: salesPageUrl.trim() || undefined,
        is_free: isFree,
        access_mode: accessMode,
        release_days: accessMode === "liberar_em_dias" && parsedDays && parsedDays > 0 ? parsedDays : null,
        display_category: displayCategory || undefined,
        badge_text: badgeText.trim() || undefined,
        show_as_card: showAsCard,
        sort_order: parsedSortOrder,
        journey_group: journeyGroup || undefined,
        journey_order: journeyOrder.trim() !== "" ? parseInt(journeyOrder, 10) : undefined,
        unlock_rule_type: unlockRuleType !== "none" ? unlockRuleType : undefined,
        unlock_rule_content_id: unlockRuleType !== "none" && unlockRuleContentId ? unlockRuleContentId : null,
        is_featured: isFeatured,
        featured_priority: featuredPriority.trim() !== "" ? parseInt(featuredPriority, 10) : 0,
        release_mode: releaseMode,
        initial_free_count: initialFreeCount.trim() !== "" ? parseInt(initialFreeCount, 10) : 0,
        locked_final_count: lockedFinalCount.trim() !== "" ? parseInt(lockedFinalCount, 10) : 0,
        locked_label: lockedLabel.trim() || null,
      };

      if (editItem) {
        await updateContentItem({ data: { id: editItem.id, ...payload } });
      } else {
        await createContentItem({ data: payload });
      }
    },
    onSuccess: () => {
      setUploading(false);
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success(editItem ? "Conteúdo atualizado!" : "Conteúdo criado!");
      setFormOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      setUploading(false);
      toastError(err);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateContentItem({ data: { id, is_active } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success("Status atualizado");
    },
    onError: (err) => toastError(err, "Erro ao atualizar status"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteContentItem({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success("Conteúdo excluído!");
    },
    onError: (err) => toastError(err, "Erro ao excluir conteúdo"),
  });

  const items = data?.items || [];
  const isSubmitting = saveMutation.isPending || uploading;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card px-6 py-4 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="font-display text-xl font-black text-foreground tracking-tight">
              Conteúdos
            </h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              E-books, videoaulas, aulas gratuitas e materiais complementares
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-gradient-to-r from-gold to-gold/85 text-background text-sm font-bold hover:shadow-lg hover:shadow-gold/20 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            Novo Conteúdo
          </button>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(v) => { if (!v) resetForm(); setFormOpen(v); }}>
        <DialogContent className="sm:max-w-lg bg-card border-border/20 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground/85 font-display font-black text-lg">
              {editItem ? "Editar Conteúdo" : "Novo Conteúdo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Tipo</Label>
              <Select value={contentType} onValueChange={setContentType} disabled={isSubmitting}>
                <SelectTrigger className="bg-card/15 border-border/30 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ebook">📚 E-book (PDF)</SelectItem>
                  <SelectItem value="video">🎬 Videoaula</SelectItem>
                  <SelectItem value="free_lesson">🎓 Aula Gratuita</SelectItem>
                  <SelectItem value="material">📄 Material Complementar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-card/15 border-border/30 text-sm" disabled={isSubmitting} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-card/15 border-border/30 text-sm min-h-[60px]" disabled={isSubmitting} />
            </div>

            {/* Cover upload */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Capa</Label>
              <ImageFieldHint ratio="16:9" recommendedSize="1280x720" autoCrop file={coverFile} previewUrl={editItem?.cover_url || null} />
              <div className="flex items-center gap-3">
                {(editItem?.cover_url || coverFile) && (
                  <img
                    src={coverFile ? URL.createObjectURL(coverFile) : editItem?.cover_url}
                    alt="Capa"
                    className="h-16 w-16 rounded-lg object-cover border border-border/30"
                  />
                )}
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/30 bg-card/15 px-3 py-2 text-xs text-muted-foreground/50 hover:border-gold/20 hover:text-gold/60 transition-all">
                  📷 Enviar capa
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} disabled={isSubmitting} />
                </label>
              </div>
            </div>

            {/* File upload for ebook/material */}
            {(contentType === "ebook" || contentType === "material") && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  Arquivo ({contentType === "ebook" ? "PDF" : "PDF, DOC, etc."})
                </Label>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/30 bg-card/15 px-3 py-2 text-xs text-muted-foreground/50 hover:border-gold/20 hover:text-gold/60 transition-all">
                  📎 {contentFile ? contentFile.name : (editItem?.file_url ? "Substituir arquivo" : "Enviar arquivo")}
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xlsx,.pptx,.zip" className="hidden" onChange={(e) => setContentFile(e.target.files?.[0] || null)} disabled={isSubmitting} />
                </label>
                {editItem?.file_url && !contentFile && (
                  <p className="text-[11px] text-muted-foreground/60">Arquivo atual já cadastrado</p>
                )}
              </div>
            )}

            {/* Video URL */}
            {(contentType === "video" || contentType === "free_lesson") && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">URL do Vídeo</Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="bg-card/15 border-border/30 text-sm" disabled={isSubmitting} />
              </div>
            )}

            {/* Sales page URL */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Página de Vendas (opcional)</Label>
              <Input value={salesPageUrl} onChange={(e) => setSalesPageUrl(e.target.value)} placeholder="https://kiwify.com.br/..." className="bg-card/15 border-border/30 text-sm" disabled={isSubmitting} />
              <p className="text-[11px] text-muted-foreground/60">Se preenchido, aparecerá um botão de compra para não-compradores</p>
            </div>

            {/* Access Mode */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Modo de Acesso</Label>
              <Select value={accessMode} onValueChange={setAccessMode} disabled={isSubmitting}>
                <SelectTrigger className="bg-card/15 border-border/30 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accessModeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Release Days - only for liberar_em_dias */}
            {accessMode === "liberar_em_dias" && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  Dias para liberar após compra
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={releaseDays}
                  onChange={(e) => setReleaseDays(e.target.value)}
                  placeholder="Ex: 7"
                  className="bg-card/15 border-border/30 text-sm"
                  disabled={isSubmitting}
                />
                <p className="text-[11px] text-muted-foreground/60">
                  O conteúdo será liberado X dias após a data de compra aprovada do cliente.
                </p>
              </div>
            )}

            {/* Display Category */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Categoria de Exibição</Label>
              <Select value={displayCategory || "__none__"} onValueChange={(v) => setDisplayCategory(v === "__none__" ? "" : v)} disabled={isSubmitting}>
                <SelectTrigger className="bg-card/15 border-border/30 text-sm">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Badge Text */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Texto do Badge (opcional)</Label>
              <Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="Ex: NOVO, BÔNUS, EM BREVE" className="bg-card/15 border-border/30 text-sm" disabled={isSubmitting} />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Ordem de Exibição</Label>
              <Input type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder="Automático" className="bg-card/15 border-border/30 text-sm" disabled={isSubmitting} />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/25 bg-card/15 p-4">
              <div>
                <p className="text-[12px] font-semibold text-foreground/70">⭐ Conteúdo em Destaque</p>
                <p className="text-xs text-muted-foreground/70">Aparece na faixa principal da home</p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} disabled={isSubmitting} />
            </div>

            {isFeatured && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Prioridade do Destaque</Label>
                <Input type="number" min="0" value={featuredPriority} onChange={(e) => setFeaturedPriority(e.target.value)} placeholder="0 = maior prioridade" className="bg-card/15 border-border/30 text-sm" disabled={isSubmitting} />
              </div>
            )}

            {/* Journey Group */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Trilha Emocional</Label>
              <Select value={journeyGroup || "__none__"} onValueChange={(v) => setJourneyGroup(v === "__none__" ? "" : v)} disabled={isSubmitting}>
                <SelectTrigger className="bg-card/15 border-border/30 text-sm">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {journeyOptions.map((opt: any) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Journey Order */}
            {journeyGroup && journeyGroup !== "none" && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Posição na Trilha</Label>
                <Input type="number" min="1" value={journeyOrder} onChange={(e) => setJourneyOrder(e.target.value)} placeholder="Ex: 1, 2, 3..." className="bg-card/15 border-border/30 text-sm" disabled={isSubmitting} />
              </div>
            )}

            {/* Unlock Rule */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Regra de Desbloqueio</Label>
              <Select value={unlockRuleType} onValueChange={setUnlockRuleType} disabled={isSubmitting}>
                <SelectTrigger className="bg-card/15 border-border/30 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem regra (padrão)</SelectItem>
                  <SelectItem value="after_watch">Após assistir outro conteúdo</SelectItem>
                  <SelectItem value="after_complete">Após concluir outro conteúdo</SelectItem>
                  <SelectItem value="after_download">Após baixar outro conteúdo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {unlockRuleType !== "none" && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Conteúdo Pré-requisito</Label>
                <Select value={unlockRuleContentId} onValueChange={setUnlockRuleContentId} disabled={isSubmitting}>
                  <SelectTrigger className="bg-card/15 border-border/30 text-sm">
                    <SelectValue placeholder="Selecione o conteúdo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {items.filter((i: any) => i.id !== editItem?.id).map((i: any) => (
                      <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground/60">
                  O usuário precisará consumir este conteúdo antes de desbloquear o atual.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-border/25 bg-card/15 p-4">
              <div>
                <p className="text-[12px] font-semibold text-foreground/70">Exibir como Card</p>
                <p className="text-xs text-muted-foreground/70">Se desativado, o conteúdo não aparece na grade</p>
              </div>
              <Switch checked={showAsCard} onCheckedChange={setShowAsCard} disabled={isSubmitting} />
            </div>

            {/* Release Mode */}
            <div className="space-y-2 rounded-xl border border-border/25 bg-card/15 p-4">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Modo de Liberação do Conteúdo</Label>
              <Select value={releaseMode} onValueChange={setReleaseMode} disabled={isSubmitting}>
                <SelectTrigger className="bg-card/15 border-border/30 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liberar_tudo">🔓 Liberar tudo de uma vez</SelectItem>
                  <SelectItem value="liberar_progressivo">⏳ Liberação progressiva (por tempo)</SelectItem>
                  <SelectItem value="liberar_com_bloqueio_final">🔒 Liberar com bloqueio final</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground/60">
                {releaseMode === "liberar_tudo" && "Todas as músicas/conteúdos serão liberados imediatamente ao comprador."}
                {releaseMode === "liberar_progressivo" && "Libera parte inicial e o restante é desbloqueado ao longo do tempo (use 'Dias para liberar' no modo de acesso)."}
                {releaseMode === "liberar_com_bloqueio_final" && "Libera a maioria do conteúdo, mas mantém as últimas músicas bloqueadas como lançamento especial."}
              </p>

              {(releaseMode === "liberar_progressivo" || releaseMode === "liberar_com_bloqueio_final") && (
                <div className="space-y-3 mt-3 pt-3 border-t border-border/15">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                      Quantidade liberada no início
                    </Label>
                    <Input
                      type="number" min="0"
                      value={initialFreeCount}
                      onChange={(e) => setInitialFreeCount(e.target.value)}
                      placeholder="Ex: 5"
                      className="bg-card/15 border-border/30 text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-[11px] text-muted-foreground/60">
                      Primeiros itens liberados imediatamente (0 = nenhum liberado de início).
                    </p>
                  </div>
                </div>
              )}

              {releaseMode === "liberar_com_bloqueio_final" && (
                <div className="space-y-3 mt-3 pt-3 border-t border-border/15">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                      Quantidade bloqueada no final
                    </Label>
                    <Input
                      type="number" min="0"
                      value={lockedFinalCount}
                      onChange={(e) => setLockedFinalCount(e.target.value)}
                      placeholder="Ex: 3"
                      className="bg-card/15 border-border/30 text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-[11px] text-muted-foreground/60">
                      Últimos itens que permanecerão bloqueados com visual premium.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                      Texto do bloqueio (opcional)
                    </Label>
                    <Input
                      value={lockedLabel}
                      onChange={(e) => setLockedLabel(e.target.value)}
                      placeholder="Ex: Lançamento especial, Nova coleção chegando"
                      className="bg-card/15 border-border/30 text-sm"
                      disabled={isSubmitting}
                    />
                    <p className="text-[11px] text-muted-foreground/60">
                      Texto exibido sobre os conteúdos bloqueados. Se vazio, mostrará "Lançamento especial".
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => { setFormOpen(false); resetForm(); }} disabled={isSubmitting} className="text-xs text-muted-foreground/70">
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!title.trim() || isSubmitting}
                className="gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-5 h-9 text-xs font-bold tracking-[0.15em] uppercase hover:bg-gold/25 hover:text-gold/85 transition-all duration-500"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-card border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground/85">Excluir conteúdo</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/50">
              Tem certeza que deseja excluir <span className="font-semibold text-foreground/70">{deleteTarget?.title}</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground/50">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteTarget) removeMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
              className="bg-destructive/80 text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Content List */}
      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : !items.length ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum conteúdo cadastrado"
          description="Crie seu primeiro conteúdo para disponibilizá-lo aos alunos."
          actionLabel="Novo Conteúdo"
          onAction={() => setFormOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => {
            const typeInfo = contentTypeLabels[item.content_type] || contentTypeLabels.material;
            const TypeIcon = typeInfo.icon;
            const effectiveAccess = item.access_mode || (item.is_free ? "gratuito" : "pago");

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-500 ${
                  item.is_active
                    ? "border-border/30 bg-card/15 hover:bg-card/20"
                    : "border-border/20 bg-card/[0.02] opacity-50"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {item.cover_url ? (
                    <img src={item.cover_url} alt="" className="h-12 w-12 rounded-lg object-cover border border-border/25 flex-shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted/10 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={`text-[11px] px-1.5 py-0 ${typeInfo.color}`}>
                        {typeInfo.label}
                      </Badge>
                      <Badge variant="outline" className={`text-[11px] px-1.5 py-0 ${
                        effectiveAccess === "gratuito"
                          ? "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8"
                          : effectiveAccess === "liberar_em_dias"
                          ? "text-amber-400/60 border-amber-500/15 bg-amber-500/8"
                          : "text-rose-400/60 border-rose-500/15 bg-rose-500/8"
                      }`}>
                        {effectiveAccess === "gratuito" ? "Gratuito" : effectiveAccess === "liberar_em_dias" ? `Libera em ${item.release_days || "?"}d` : "Pago"}
                      </Badge>
                      {item.is_featured && (
                        <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-yellow-400/70 border-yellow-500/20 bg-yellow-500/10">
                          ⭐ Destaque
                        </Badge>
                      )}
                      {item.release_mode && item.release_mode !== 'liberar_tudo' && (
                        <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-cyan-400/60 border-cyan-500/15 bg-cyan-500/8">
                          {item.release_mode === 'liberar_progressivo' ? '⏳ Progressivo' : '🔒 Bloqueio final'}
                        </Badge>
                      )}
                      {item.display_category && (
                        <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-muted-foreground/70 border-border/30">
                          {item.display_category.replace(/_/g, " ")}
                        </Badge>
                      )}
                      {item.badge_text && (
                        <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-gold/70 border-gold/15 bg-gold/5">
                          {item.badge_text}
                        </Badge>
                      )}
                      {item.journey_group && (
                        <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-purple-400/50 border-purple-500/15 bg-purple-500/5">
                          trilha: {item.journey_group.replace(/_/g, " ")}
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground/50">#{item.sort_order}</span>
                    </div>
                  </div>
                </div>

                <AdminActionButtons
                  onEdit={() => openEdit(item)}
                  isActive={item.is_active}
                  onToggle={(newState) => toggleMutation.mutate({ id: item.id, is_active: newState })}
                  toggling={toggleMutation.isPending && (toggleMutation.variables as any)?.id === item.id}
                  onDelete={() => setDeleteTarget(item)}
                  extraBefore={
                    item.sales_page_url ? (
                      <a href={item.sales_page_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/25 bg-card/20 text-muted-foreground/70 text-xs font-semibold hover:text-gold hover:border-gold/25 transition-all" title="Página de vendas">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Vendas</span>
                      </a>
                    ) : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
