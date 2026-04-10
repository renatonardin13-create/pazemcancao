import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { updateTrack } from "@/lib/admin-tracks.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Paz", "Cura", "Força", "Oração", "Madrugada", "Presença", "Refúgio"];

interface EditTrackDialogProps {
  track: {
    id: string;
    title: string;
    category: string;
    description: string | null;
    cover_url: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTrackDialog({ track, open, onOpenChange }: EditTrackDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(track.title);
  const [category, setCategory] = useState(track.category);
  const [description, setDescription] = useState(track.description || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(track.cover_url);
  const [uploading, setUploading] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let cover_url = track.cover_url;

      // Upload new cover if selected
      if (coverFile) {
        setUploading(true);
        const fileName = `covers/${track.id}.png`;
        const { error: uploadError } = await supabase.storage
          .from("tracks")
          .upload(fileName, coverFile, {
            contentType: coverFile.type,
            upsert: true,
          });

        if (uploadError) {
          throw new Error("Erro ao enviar capa: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("tracks")
          .getPublicUrl(fileName);

        cover_url = urlData.publicUrl + "?t=" + Date.now();
        setUploading(false);
      }

      await updateTrack({
        data: {
          id: track.id,
          title: title.trim(),
          category,
          description: description.trim() || undefined,
          cover_url: cover_url || undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Música atualizada!");
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setUploading(false);
      toast.error(err.message);
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }

    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(track.cover_url);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSubmitting = saveMutation.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/20">
        <DialogHeader>
          <DialogTitle className="text-foreground/85">Editar Música</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Cover */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
              Capa (500×500px recomendado)
            </Label>
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Capa"
                    className="h-20 w-20 rounded-xl object-cover border border-border/15"
                  />
                  {coverFile && (
                    <button
                      onClick={removeCover}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive/80 text-white flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted/15 border border-dashed border-border/20">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border/15 bg-card/15 px-3 py-2 text-[11px] text-muted-foreground/50 hover:border-gold/20 hover:text-gold/60 transition-all">
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
                <p className="text-[9px] text-muted-foreground/25 mt-1">
                  Formato quadrado 1:1
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
              Título
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-card/15 border-border/15 text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
              Categoria
            </Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger className="bg-card/15 border-border/15 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
              Descrição
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-card/15 border-border/15 text-sm min-h-[70px]"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-[11px] text-muted-foreground/40"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!title.trim() || isSubmitting}
              className="gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-5 h-9 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-gold/25 hover:text-gold/85 transition-all duration-500"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
