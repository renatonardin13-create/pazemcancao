import { toastError } from "@/lib/toast-utils";
import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { updateTrack } from "@/lib/admin-tracks.functions";
import { listAdminCategories } from "@/lib/admin-categories.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, X, ImageIcon, Gift } from "lucide-react";
import { ImageFieldHint } from "@/components/ImageFieldHint";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditTrackDialogProps {
  track: {
    id: string;
    title: string;
    category: string;
    description: string | null;
    cover_url: string | null;
    is_bonus?: boolean;
    bonus_release_date?: string | null;
    // area_id removed
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTrackDialog({ track, open, onOpenChange }: EditTrackDialogProps) {
  const queryClient = useQueryClient();
  const { data: catData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });
  // areas query removed
  const categories = (catData?.categories || []).map((c: any) => c.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(track.title);
  const [category, setCategory] = useState(track.category);
  const [description, setDescription] = useState(track.description || "");
  // areaId state removed
  const [isBonus, setIsBonus] = useState(track.is_bonus || false);
  const [bonusDays, setBonusDays] = useState<string>(() => {
    if (!track.bonus_release_date) return "";
    const release = new Date(track.bonus_release_date + "T00:00:00");
    const now = new Date();
    const diffDays = Math.max(0, Math.ceil((release.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return diffDays > 0 ? String(diffDays) : "";
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(track.cover_url);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      setStatusMessage(null);
      setStatusType(null);

      let cover_url: string | null = track.cover_url;

      // Cover was removed
      if (!coverPreview && !coverFile) {
        cover_url = null;
      } else if (coverFile) {
        // Upload new cover
        setUploading(true);

        // Refresh session to avoid JWT expiration
        await supabase.auth.refreshSession().catch(() => {});

        const ext = (coverFile.name.split(".").pop() || "jpg").toLowerCase();
        const fileName = `tracks/${track.id}-${Date.now()}.${ext}`;

        console.log("[EditTrackDialog] Iniciando upload da capa", {
          trackId: track.id,
          fileName,
          fileType: coverFile.type,
          fileSize: coverFile.size,
        });

        let { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(fileName, coverFile, {
            contentType: coverFile.type,
            upsert: true,
          });

        // Retry once if token expired
        if (uploadError && /exp.*claim|jwt|expired/i.test(uploadError.message)) {
          await supabase.auth.refreshSession();
          const retry = await supabase.storage
            .from("covers")
            .upload(fileName, coverFile, {
              contentType: coverFile.type,
              upsert: true,
            });
          uploadError = retry.error;
        }

        if (uploadError) {
          console.error("[EditTrackDialog] Erro no upload da capa:", uploadError);
          throw new Error("Erro ao enviar capa: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("covers")
          .getPublicUrl(fileName);

        console.log("[EditTrackDialog] URL pública gerada", urlData.publicUrl);
        cover_url = urlData.publicUrl + "?t=" + Date.now();
        setUploading(false);
      }

      console.log("[EditTrackDialog] Atualizando track", {
        id: track.id,
        title: title.trim(),
        category,
        hasCover: !!cover_url,
      });

      const computedReleaseDate = isBonus && bonusDays && parseInt(bonusDays) > 0
        ? new Date(Date.now() + parseInt(bonusDays) * 86400000).toISOString().split("T")[0]
        : null;

      await updateTrack({
        data: {
          id: track.id,
          title: title.trim(),
          category,
          description: description.trim() || undefined,
          cover_url: cover_url === null ? "" : (cover_url || undefined),
          // area_id removed
          is_bonus: isBonus,
          bonus_release_date: computedReleaseDate,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      setStatusType("success");
      setStatusMessage("Música atualizada com sucesso.");
      toast.success("Música atualizada!");
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setUploading(false);
      console.error("[EditTrackDialog] Falha ao salvar:", err);
      setStatusType("error");
      setStatusMessage(err.message || "Falha ao salvar a capa.");
      toastError(err);
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusType("error");
      setStatusMessage("Selecione uma imagem válida.");
      toast.error("Selecione uma imagem válida.");
      return;
    }

    setStatusMessage(null);
    setStatusType(null);

    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSubmitting = saveMutation.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Música</DialogTitle>
          <p className="text-xs text-muted-foreground">Atualize as informações da música</p>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5 max-h-[65vh] overflow-y-auto">
          {statusMessage ? (
            <Alert variant={statusType === "error" ? "destructive" : "default"}>
              <AlertTitle>
                {statusType === "error" ? "Erro no upload" : "Sucesso"}
              </AlertTitle>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          ) : null}

          {/* Cover */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground/80">
              Capa
            </Label>
            <ImageFieldHint ratio="1:1" recommendedSize="500x500" file={coverFile} previewUrl={coverPreview} />
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Capa"
                    className="h-20 w-20 rounded-xl object-cover border border-border/30"
                  />
                  <button
                    onClick={removeCover}
                    disabled={isSubmitting}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive/80 text-white flex items-center justify-center hover:bg-destructive transition-colors"
                    title="Remover capa"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border/20">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/25 bg-muted/5 px-3 py-2 text-xs text-muted-foreground hover:border-gold/20 hover:text-gold transition-all">
                  <Upload className="h-3.5 w-3.5" />
                  Enviar imagem
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                    disabled={isSubmitting}
                  />
                </label>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  Formato quadrado 1:1
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/80">
              Título
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50 border-border/20 focus:border-gold/40 text-sm h-10"
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/80">
              Categoria
            </Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger className="bg-background/50 border-border/20 text-sm h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: string) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* area selection removed */}

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/80">
              Descrição
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/50 border-border/20 focus:border-gold/40 text-sm min-h-[70px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Bonus */}
          <div className="space-y-3 rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-400/60" />
                <Label className="text-xs font-semibold text-foreground/80">
                  Música Bônus
                </Label>
              </div>
              <Switch
                checked={isBonus}
                onCheckedChange={setIsBonus}
                disabled={isSubmitting}
              />
            </div>
            {isBonus && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground/80">
                  Liberar em quantos dias?
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    placeholder="Ex: 7"
                    value={bonusDays}
                    onChange={(e) => setBonusDays(e.target.value)}
                    className="bg-background/50 border-border/20 text-sm w-24 h-10"
                    disabled={isSubmitting}
                  />
                  <span className="text-xs text-muted-foreground">dias</span>
                </div>
                {bonusDays && parseInt(bonusDays) > 0 && (
                  <p className="text-xs text-amber-400/60">
                    📅 Será liberada em {new Date(Date.now() + parseInt(bonusDays) * 86400000).toLocaleDateString("pt-BR")}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground/60">
                  A música ficará bloqueada por esse período. Se não definir, ficará bloqueada indefinidamente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border/15 bg-muted/[0.03]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : null}
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
