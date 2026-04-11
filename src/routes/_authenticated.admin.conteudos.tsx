import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminContentItems,
  createContentItem,
  updateContentItem,
  deleteContentItem,
} from "@/lib/admin-content.functions";
import {
  BookOpen, Video, GraduationCap, FileText, Plus, Trash2,
  ToggleLeft, ToggleRight, Pencil, Loader2, ExternalLink,
} from "lucide-react";
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
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/conteudos")({
  component: AdminContentPage,
});

const contentTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  ebook: { label: "E-book", icon: BookOpen, color: "text-blue-400/60 border-blue-500/15 bg-blue-500/8" },
  video: { label: "Videoaula", icon: Video, color: "text-purple-400/60 border-purple-500/15 bg-purple-500/8" },
  free_lesson: { label: "Aula Gratuita", icon: GraduationCap, color: "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8" },
  material: { label: "Material", icon: FileText, color: "text-amber-400/60 border-amber-500/15 bg-amber-500/8" },
};

const displayCategoryOptions = [
  { value: "bonus_exclusivos", label: "🎁 Bônus Exclusivos" },
  { value: "soldado_ferido", label: "⚔️ Soldado Ferido" },
  { value: "ansiedade", label: "🧘 Ansiedade" },
  { value: "cura_da_alma", label: "💚 Cura da Alma" },
  { value: "refugio", label: "🏠 Refúgio" },
  { value: "nao_desista", label: "💪 Não Desista" },
  { value: "destaques", label: "⭐ Destaques" },
  { value: "geral", label: "📂 Geral" },
];

function AdminContentPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Form state — existing fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("ebook");
  const [videoUrl, setVideoUrl] = useState("");
  const [salesPageUrl, setSalesPageUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state — new fields
  const [accessMode, setAccessMode] = useState("pago");
  const [releaseDays, setReleaseDays] = useState("");
  const [displayCategory, setDisplayCategory] = useState("");
  const [showAsCard, setShowAsCard] = useState(true);
  const [displayOrder, setDisplayOrder] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [cardCoverFile, setCardCoverFile] = useState<File | null>(null);
  const cardCoverInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: () => listAdminContentItems(),
    staleTime: 30_000,
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContentType("ebook");
    setVideoUrl("");
    setSalesPageUrl("");
    setCoverFile(null);
    setContentFile(null);
    setEditItem(null);
    setAccessMode("pago");
    setReleaseDays("");
    setDisplayCategory("");
    setShowAsCard(true);
    setDisplayOrder("");
    setBadgeText("");
    setCardCoverFile(null);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setContentType(item.content_type);
    setVideoUrl(item.video_url || "");
    setSalesPageUrl(item.sales_page_url || "");
    setCoverFile(null);
    setContentFile(null);
    // New fields with fallback for old records
    setAccessMode(item.access_mode || (item.is_free ? "gratuito" : item.release_days ? "liberar_em_dias" : "pago"));
    setReleaseDays(item.release_days != null ? String(item.release_days) : "");
    setDisplayCategory(item.display_category || "");
    setShowAsCard(item.show_as_card !== false);
    setDisplayOrder(item.sort_order != null ? String(item.sort_order) : "");
    setBadgeText(item.badge_text || "");
    setCardCoverFile(null);
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
      let card_cover_url = editItem?.card_cover_url || undefined;

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

      if (cardCoverFile) {
        const path = `card-covers/${itemId}.${cardCoverFile.name.split('.').pop()}`;
        const { error } = await supabase.storage.from("content-files").upload(path, cardCoverFile, { upsert: true });
        if (error) throw new Error("Erro no upload da capa do card: " + error.message);
        const { data: urlData } = supabase.storage.from("content-files").getPublicUrl(path);
        card_cover_url = urlData.publicUrl + "?t=" + Date.now();
      }

      const parsedDays = releaseDays.trim() !== "" ? parseInt(releaseDays, 10) : null;
      const parsedOrder = displayOrder.trim() !== "" ? parseInt(displayOrder, 10) : undefined;

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        content_type: contentType,
        cover_url,
        file_url,
        video_url: videoUrl.trim() || undefined,
        sales_page_url: salesPageUrl.trim() || undefined,
        access_mode: accessMode,
        is_free: accessMode === "gratuito",
        release_days: accessMode === "liberar_em_dias" && parsedDays && parsedDays > 0 ? parsedDays : null,
        display_category: displayCategory || null,
        show_as_card: showAsCard,
        badge_text: badgeText.trim() || null,
        card_cover_url,
        sort_order: parsedOrder,
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
      toast.error(err.message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateContentItem({ data: { id, is_active } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success("Status atualizado");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteContentItem({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success("Conteúdo excluído!");
    },
  });

  const items = data?.items || [];
  const isSubmitting = saveMutation.isPending || uploading;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Conteúdos
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/40">
            E-books, videoaulas, aulas gratuitas e materiais complementares
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl h-10 px-4 text-[11px] font-semibold uppercase tracking-wider bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22 transition-all duration-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Conteúdo
        </button>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(v) => { if (!v) resetForm(); setFormOpen(v); }}>
        <DialogContent className="sm:max-w-lg bg-card border-border/20 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground/85">
              {editItem ? "Editar Conteúdo" : "Novo Conteúdo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Tipo de conteúdo */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">Tipo</Label>
              <Select value={contentType} onValueChange={setContentType} disabled={isSubmitting}>
                <SelectTrigger className="bg-card/15 border-border/15 text-sm">
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

            {/* Título */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-card/15 border-border/15 text-sm" disabled={isSubmitting} />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-card/15 border-border/15 text-sm min-h-[60px]" disabled={isSubmitting} />
            </div>

            {/* Cover upload */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">Capa</Label>
              <div className="flex items-center gap-3">
                {(editItem?.cover_url || coverFile) && (
                  <img
                    src={coverFile ? URL.createObjectURL(coverFile) : editItem?.cover_url}
                    alt="Capa"
                    className="h-16 w-16 rounded-lg object-cover border border-border/15"
                  />
                )}
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/15 bg-card/15 px-3 py-2 text-[11px] text-muted-foreground/50 hover:border-gold/20 hover:text-gold/60 transition-all">
                  📷 Enviar capa
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} disabled={isSubmitting} />
                </label>
              </div>
            </div>

            {/* File upload for ebook/material */}
            {(contentType === "ebook" || contentType === "material") && (
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Arquivo ({contentType === "ebook" ? "PDF" : "PDF, DOC, etc."})
                </Label>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/15 bg-card/15 px-3 py-2 text-[11px] text-muted-foreground/50 hover:border-gold/20 hover:text-gold/60 transition-all">
                  📎 {contentFile ? contentFile.name : (editItem?.file_url ? "Substituir arquivo" : "Enviar arquivo")}
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xlsx,.pptx,.zip" className="hidden" onChange={(e) => setContentFile(e.target.files?.[0] || null)} disabled={isSubmitting} />
                </label>
                {editItem?.file_url && !contentFile && (
                  <p className="text-[9px] text-muted-foreground/30">Arquivo atual já cadastrado</p>
                )}
              </div>
            )}

            {/* Video URL */}
            {(contentType === "video" || contentType === "free_lesson") && (
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">URL do Vídeo</Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="bg-card/15 border-border/15 text-sm" disabled={isSubmitting} />
              </div>
            )}

            {/* Sales page URL */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">Página de Vendas (opcional)</Label>
              <Input value={salesPageUrl} onChange={(e) => setSalesPageUrl(e.target.value)} placeholder="https://kiwify.com.br/..." className="bg-card/15 border-border/15 text-sm" disabled={isSubmitting} />
              <p className="text-[9px] text-muted-foreground/25">Se preenchido, aparecerá um botão de compra para não-compradores</p>
            </div>

            {/* ═══════ NOVOS CAMPOS ═══════ */}

            <div className="border-t border-border/10 pt-4 mt-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 mb-4 font-semibold">
                Configurações de exibição
              </p>

              {/* 1. Categoria de exibição */}
              <div className="space-y-2 mb-4">
                <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Categoria de Exibição
                </Label>
                <Select value={displayCategory} onValueChange={setDisplayCategory} disabled={isSubmitting}>
                  <SelectTrigger className="bg-card/15 border-border/15 text-sm">
                    <SelectValue placeholder="Selecione a categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">📂 Sem categoria</SelectItem>
                    {displayCategoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[9px] text-muted-foreground/25">Em qual seção/trilho do app o card aparecerá</p>
              </div>

              {/* 2. Modo de acesso */}
              <div className="space-y-2 mb-4">
                <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Modo de Acesso
                </Label>
                <Select value={accessMode} onValueChange={setAccessMode} disabled={isSubmitting}>
                  <SelectTrigger className="bg-card/15 border-border/15 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuito">🟢 Gratuito</SelectItem>
                    <SelectItem value="pago">🔒 Pago</SelectItem>
                    <SelectItem value="liberar_em_dias">📅 Liberar em dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Dias para liberar — só se access_mode = liberar_em_dias */}
              {accessMode === "liberar_em_dias" && (
                <div className="space-y-2 mb-4">
                  <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                    Dias para liberar
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={releaseDays}
                    onChange={(e) => setReleaseDays(e.target.value)}
                    placeholder="Ex: 7"
                    className="bg-card/15 border-border/15 text-sm"
                    disabled={isSubmitting}
                  />
                  <p className="text-[9px] text-muted-foreground/25">
                    O conteúdo será liberado X dias após a data de compra do cliente
                  </p>
                </div>
              )}

              {/* 4. Exibir como card */}
              <div className="flex items-center justify-between rounded-xl border border-border/10 bg-card/5 p-4 mb-4">
                <div>
                  <p className="text-[12px] font-semibold text-foreground/70">Exibir como Card</p>
                  <p className="text-[10px] text-muted-foreground/40">Mostrar este conteúdo no app como card visual</p>
                </div>
                <Switch checked={showAsCard} onCheckedChange={setShowAsCard} disabled={isSubmitting} />
              </div>

              {/* 5. Ordem de exibição */}
              <div className="space-y-2 mb-4">
                <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Ordem de Exibição
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="0 (menor = primeiro)"
                  className="bg-card/15 border-border/15 text-sm"
                  disabled={isSubmitting}
                />
              </div>

              {/* 6. Badge texto */}
              <div className="space-y-2 mb-4">
                <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Badge (opcional)
                </Label>
                <Input
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="Ex: BÔNUS, NOVO, VIP, GRÁTIS"
                  className="bg-card/15 border-border/15 text-sm"
                  maxLength={30}
                  disabled={isSubmitting}
                />
                <p className="text-[9px] text-muted-foreground/25">Texto exibido como badge no card do app</p>
              </div>

              {/* 7. Capa do card */}
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Capa do Card (opcional)
                </Label>
                <div className="flex items-center gap-3">
                  {(editItem?.card_cover_url || cardCoverFile) && (
                    <img
                      src={cardCoverFile ? URL.createObjectURL(cardCoverFile) : editItem?.card_cover_url}
                      alt="Capa do card"
                      className="h-16 w-16 rounded-lg object-cover border border-border/15"
                    />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/15 bg-card/15 px-3 py-2 text-[11px] text-muted-foreground/50 hover:border-gold/20 hover:text-gold/60 transition-all">
                    🖼️ {cardCoverFile ? cardCoverFile.name : "Enviar capa do card"}
                    <input ref={cardCoverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCardCoverFile(e.target.files?.[0] || null)} disabled={isSubmitting} />
                  </label>
                </div>
                <p className="text-[9px] text-muted-foreground/25">Se vazio, será usada a capa principal</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => { setFormOpen(false); resetForm(); }} disabled={isSubmitting} className="text-[11px] text-muted-foreground/40">
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!title.trim() || isSubmitting}
                className="gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-5 h-9 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-gold/25 hover:text-gold/85 transition-all duration-500"
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
        <div className="text-center py-16">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">Carregando...</p>
        </div>
      ) : !items.length ? (
        <div className="text-center py-16 rounded-2xl border border-border/15 bg-card/5">
          <BookOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/35">Nenhum conteúdo cadastrado.</p>
          <p className="text-[11px] text-muted-foreground/25 mt-1">Clique em "Novo Conteúdo" para adicionar.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/15 overflow-hidden">
          {items.map((item: any) => {
            const typeInfo = contentTypeLabels[item.content_type] || contentTypeLabels.material;
            const TypeIcon = typeInfo.icon;
            const itemAccessMode = item.access_mode || (item.is_free ? "gratuito" : item.release_days ? "liberar_em_dias" : "pago");
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-border/8 last:border-0 hover:bg-card/10 transition-colors">
                {item.cover_url ? (
                  <img src={item.cover_url} alt={item.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/15 shrink-0">
                    <TypeIcon className="h-5 w-5 text-muted-foreground/25" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground/75 truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground/30 truncate">
                    {item.description || "Sem descrição"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <Badge variant="outline" className={`text-[9px] rounded-full px-2 border ${typeInfo.color}`}>
                    <TypeIcon className="h-2.5 w-2.5 mr-1" />
                    {typeInfo.label}
                  </Badge>
                  {/* Access mode badge */}
                  {itemAccessMode === "gratuito" && (
                    <Badge variant="outline" className="text-[9px] rounded-full px-2 border text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8">
                      🟢 Gratuito
                    </Badge>
                  )}
                  {itemAccessMode === "liberar_em_dias" && (
                    <Badge variant="outline" className="text-[9px] rounded-full px-2 border text-blue-400/60 border-blue-500/15 bg-blue-500/8">
                      📅 {item.release_days || "?"}d
                    </Badge>
                  )}
                  {itemAccessMode === "pago" && (
                    <Badge variant="outline" className="text-[9px] rounded-full px-2 border text-amber-400/60 border-amber-500/15 bg-amber-500/8">
                      🔒 Pago
                    </Badge>
                  )}
                  {/* Display category badge */}
                  {item.display_category && item.display_category !== "none" && (
                    <Badge variant="outline" className="text-[9px] rounded-full px-2 border text-muted-foreground/40 border-border/20">
                      {displayCategoryOptions.find(c => c.value === item.display_category)?.label || item.display_category}
                    </Badge>
                  )}
                  {/* Badge text */}
                  {item.badge_text && (
                    <Badge variant="outline" className="text-[9px] rounded-full px-2 border text-gold/60 border-gold/15 bg-gold/8">
                      {item.badge_text}
                    </Badge>
                  )}
                  {/* Show as card indicator */}
                  {item.show_as_card === false && (
                    <Badge variant="outline" className="text-[9px] rounded-full px-2 border text-muted-foreground/30 border-border/15">
                      Oculto no app
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-[9px] rounded-full px-2 border ${item.is_active ? "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8" : "text-muted-foreground/30 border-border/20"}`}>
                    {item.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors" title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {item.sales_page_url && (
                    <a href={item.sales_page_url} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors" title="Página de vendas">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => toggleMutation.mutate({ id: item.id, is_active: !item.is_active })}
                    className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors"
                    title={item.is_active ? "Desativar" : "Ativar"}
                  >
                    {item.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-2 text-muted-foreground/30 hover:text-destructive/60 transition-colors" title="Remover">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
