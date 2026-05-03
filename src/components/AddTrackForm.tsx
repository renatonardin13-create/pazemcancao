import { toastError } from "@/lib/toast-utils";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createTrack } from "@/lib/admin-tracks.functions";
import { listAdminCategories } from "@/lib/admin-categories.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, ImageIcon, Music, X, Gift } from "lucide-react";
import { ImageFieldHint } from "@/components/ImageFieldHint";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAdminActiveArea } from "@/hooks/use-admin-active-area";

interface AddTrackFormProps {
  onSuccess?: () => void;
}

export function AddTrackForm({ onSuccess }: AddTrackFormProps) {
  const queryClient = useQueryClient();
  const { activeArea } = useAdminActiveArea();
  
  const { data: catData } = useQuery({
    queryKey: ["admin-categories", activeArea?.id],
    queryFn: () => listAdminCategories({ data: { areaId: activeArea?.id } }),
    enabled: !!activeArea?.id,
  });
  const categories = (catData?.categories || []).map((c: any) => c.name);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  // areaId state removed
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isBonus, setIsBonus] = useState(false);
  const [bonusReleaseDate, setBonusReleaseDate] = useState("");
  const [uploading, setUploading] = useState(false);

  const addTrackMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !mp3File) {
        throw new Error("Título e arquivo MP3 são obrigatórios");
      }

      setUploading(true);

      // 1. Upload MP3
      const fileName = `audio/${crypto.randomUUID()}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from("tracks")
        .upload(fileName, mp3File, { contentType: "audio/mpeg" });

      if (uploadError) {
        throw new Error("Erro ao enviar MP3: " + uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from("tracks")
        .getPublicUrl(fileName);

      // 2. Upload cover if provided
      let coverUrl: string | undefined;
      if (coverFile) {
        const coverName = `${crypto.randomUUID()}.${coverFile.name.split('.').pop()}`;
        const { error: coverError } = await supabase.storage
          .from("covers")
          .upload(coverName, coverFile, { contentType: coverFile.type, upsert: true });

        if (coverError) {
          console.error("Cover upload error:", coverError);
          toast.error("Erro ao enviar capa, mas a música será salva sem capa.");
        } else {
          const { data: coverUrlData } = supabase.storage
            .from("covers")
            .getPublicUrl(coverName);
          coverUrl = coverUrlData.publicUrl;
        }
      }

      setUploading(false);

      // 3. Insert track
      const result = await createTrack({
        data: {
          title: title.trim(),
          category,
          duration: duration || "0:00",
          storage_path: fileName,
          area_id: activeArea?.id,
          download_url: urlData.publicUrl,
          description: description || undefined,
          cover_url: coverUrl,
          is_bonus: isBonus,
          bonus_release_date: isBonus && bonusReleaseDate ? bonusReleaseDate : undefined,
        },
      });

      return result.track;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Louvor adicionado com sucesso!");
      resetForm();
      onSuccess?.();
    },
    onError: (err: Error) => {
      setUploading(false);
      toastError(err);
    },
  });

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDuration("");
    setDescription("");
    // setAreaId removed
    setMp3File(null);
    setCoverFile(null);
    setCoverPreview(null);
    setIsBonus(false);
    setBonusReleaseDate("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "audio/mpeg" || file.name.endsWith(".mp3"))) {
      setMp3File(file);

      // Auto-fill title from filename (remove extension, replace separators)
      const nameWithoutExt = file.name.replace(/\.mp3$/i, '');
      const cleanTitle = nameWithoutExt
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!title.trim()) {
        setTitle(cleanTitle);
      }

      // Auto-fill description if empty
      if (!description.trim()) {
        setDescription(`Louvor: ${cleanTitle}`);
      }

      // Extract duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setDuration(`${mins}:${String(secs).padStart(2, "0")}`);
        URL.revokeObjectURL(audio.src);
      };
    } else if (file) {
      toast.error("Selecione um arquivo MP3 válido.");
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else if (file) {
      toast.error("Selecione uma imagem PNG ou JPG.");
    }
  };

  const isSubmitting = uploading || addTrackMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10">
          <Music className="h-4 w-4 text-gold/60" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground/80">Adicionar Louvor</h3>
          <p className="text-xs text-muted-foreground/70">Preencha os campos e envie o arquivo MP3</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
            Título da Música *
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Paz em Meio ao Caos"
            className="bg-card/15 border-border/30 text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
            Categoria
          </Label>
          <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
            <SelectTrigger className="bg-card/15 border-border/30 text-sm">
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
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          Descrição (opcional)
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Uma breve descrição do louvor..."
          className="bg-card/15 border-border/30 text-sm min-h-[70px]"
          disabled={isSubmitting}
        />
      </div>

      {/* MP3 Upload */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          Arquivo MP3 *
        </Label>
        {mp3File ? (
          <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/15 p-3">
            <Music className="h-4 w-4 text-gold/70 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/70 truncate">{mp3File.name}</p>
              {duration && (
                <p className="text-xs text-muted-foreground/60">{duration}</p>
              )}
            </div>
            <button
              onClick={() => { setMp3File(null); setDuration(""); }}
              className="text-muted-foreground/60 hover:text-muted-foreground/60"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/20 bg-card/20 p-6 cursor-pointer hover:border-gold/20 hover:bg-card/15 transition-all duration-300">
            <Upload className="h-5 w-5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/70">
              Clique para selecionar um arquivo MP3
            </span>
            <input
              type="file"
              accept="audio/mpeg,.mp3"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </label>
        )}
      </div>

      {/* Cover Upload */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          Capa da música (opcional)
        </Label>
        <ImageFieldHint ratio="1:1" recommendedSize="500x500" file={coverFile} />
        {coverPreview ? (
          <div className="flex items-center gap-4">
            <img
              src={coverPreview}
              alt="Capa selecionada"
              className="h-20 w-20 rounded-xl object-cover border border-border/30"
            />
            <button
              onClick={() => { setCoverFile(null); setCoverPreview(null); }}
              className="text-muted-foreground/60 hover:text-muted-foreground/60"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/20 bg-card/20 p-4 cursor-pointer hover:border-gold/20 hover:bg-card/15 transition-all duration-300">
            <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/70">
              Clique para selecionar uma imagem
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleCoverChange}
              disabled={isSubmitting}
            />
          </label>
        )}
      </div>

      {/* Bonus */}
      <div className="space-y-3 rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-amber-400/60" />
            <Label className="text-[12px] font-semibold text-foreground/70">
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
            <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              Data de Liberação
            </Label>
            <Input
              type="date"
              value={bonusReleaseDate}
              onChange={(e) => setBonusReleaseDate(e.target.value)}
              className="bg-card/15 border-border/30 text-sm"
              disabled={isSubmitting}
            />
            <p className="text-[11px] text-muted-foreground/60">
              A música ficará bloqueada até esta data.
            </p>
          </div>
        )}
      </div>

      {/* Status */}
      {isSubmitting && (
        <div className="flex items-center gap-3 rounded-xl border border-gold/10 bg-gold/[0.04] p-3">
          <Loader2 className="h-4 w-4 text-gold/70 animate-spin" />
          <span className="text-xs text-gold/70">
            {uploading ? "Enviando arquivos..." : "Salvando..."}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => addTrackMutation.mutate()}
          disabled={!title.trim() || !mp3File || isSubmitting}
          className="gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-6 h-10 text-xs font-bold tracking-[0.15em] uppercase hover:bg-gold/25 hover:text-gold/85 transition-all duration-500"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
          {isSubmitting ? "Processando..." : "Adicionar Louvor"}
        </Button>

        <Button
          variant="ghost"
          onClick={resetForm}
          disabled={isSubmitting}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground/50"
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}
