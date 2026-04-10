import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createTrack, regenerateCover } from "@/lib/admin-tracks.functions";
import { listAdminCategories } from "@/lib/admin-categories.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, ImageIcon, Music, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AddTrackFormProps {
  onSuccess?: () => void;
}

export function AddTrackForm({ onSuccess }: AddTrackFormProps) {
  const queryClient = useQueryClient();
  const { data: catData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listAdminCategories(),
  });
  const categories = (catData?.categories || []).map((c: any) => c.name);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const addTrackMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !mp3File) {
        throw new Error("Título e arquivo MP3 são obrigatórios");
      }

      setUploading(true);

      // 1. Upload MP3 to storage
      const fileName = `audio/${crypto.randomUUID()}.mp3`;
      console.log("[AddTrack] Uploading MP3:", fileName, "size:", mp3File.size);
      
      const { error: uploadError } = await supabase.storage
        .from("tracks")
        .upload(fileName, mp3File, { contentType: "audio/mpeg" });

      if (uploadError) {
        console.error("[AddTrack] Upload error:", uploadError);
        throw new Error("Erro ao enviar MP3: " + uploadError.message);
      }

      console.log("[AddTrack] Upload OK, getting public URL");

      // Get public URL for download
      const { data: urlData } = supabase.storage
        .from("tracks")
        .getPublicUrl(fileName);

      setUploading(false);

      // 2. Insert track via server function (bypasses RLS)
      console.log("[AddTrack] Creating track record...");
      const result = await createTrack({
        data: {
          title: title.trim(),
          category,
          duration: duration || "0:00",
          storage_path: fileName,
          download_url: urlData.publicUrl,
          description: description || undefined,
        },
      });

      const track = result.track;
      console.log("[AddTrack] Track created:", track.id);

      // 3. Generate cover with AI via server function
      setGeneratingCover(true);
      try {
        const coverResult = await regenerateCover({
          data: { trackId: track.id, title: title.trim() },
        });
        if (coverResult.coverUrl) {
          setCoverPreview(coverResult.coverUrl);
          toast.success("Capa gerada com sucesso!");
        } else {
          toast.info("Capa não gerada. Será usada capa padrão.");
        }
      } catch (coverErr) {
        console.error("[AddTrack] Cover error:", coverErr);
        toast.info("Capa não gerada. Será usada capa padrão.");
      }

      setGeneratingCover(false);
      return track;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Louvor adicionado com sucesso!");
      resetForm();
      onSuccess?.();
    },
    onError: (err: Error) => {
      console.error("[AddTrack] Mutation error:", err);
      setUploading(false);
      setGeneratingCover(false);
      toast.error(err.message);
    },
  });

  const resetForm = () => {
    setTitle("");
    setCategory("Paz");
    setDuration("");
    setDescription("");
    setMp3File(null);
    setCoverPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "audio/mpeg" || file.name.endsWith(".mp3"))) {
      setMp3File(file);

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

  const isSubmitting = uploading || generatingCover || addTrackMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10">
          <Music className="h-4 w-4 text-gold/60" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground/80">Adicionar Louvor</h3>
          <p className="text-[10px] text-muted-foreground/35">A capa será gerada automaticamente por IA</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
            Título da Música *
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Paz em Meio ao Caos"
            className="bg-card/15 border-border/15 text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
            Categoria
          </Label>
          <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
            <SelectTrigger className="bg-card/15 border-border/15 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c: string) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
          Descrição (opcional)
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Uma breve descrição do louvor..."
          className="bg-card/15 border-border/15 text-sm min-h-[70px]"
          disabled={isSubmitting}
        />
      </div>

      {/* MP3 Upload */}
      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
          Arquivo MP3 *
        </Label>
        {mp3File ? (
          <div className="flex items-center gap-3 rounded-xl border border-border/15 bg-card/15 p-3">
            <Music className="h-4 w-4 text-gold/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/70 truncate">{mp3File.name}</p>
              {duration && (
                <p className="text-[10px] text-muted-foreground/30">{duration}</p>
              )}
            </div>
            <button
              onClick={() => { setMp3File(null); setDuration(""); }}
              className="text-muted-foreground/30 hover:text-muted-foreground/60"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/20 bg-card/10 p-6 cursor-pointer hover:border-gold/20 hover:bg-card/15 transition-all duration-300">
            <Upload className="h-5 w-5 text-muted-foreground/25" />
            <span className="text-[11px] text-muted-foreground/35">
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

      {/* Cover preview */}
      {coverPreview && (
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40">
            Capa Gerada
          </Label>
          <div className="flex items-center gap-4">
            <img
              src={coverPreview}
              alt="Capa gerada"
              className="h-20 w-20 rounded-xl object-cover border border-border/15"
            />
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/60">
              <Sparkles className="h-3 w-3" />
              Gerada por IA
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      {isSubmitting && (
        <div className="flex items-center gap-3 rounded-xl border border-gold/10 bg-gold/[0.04] p-3">
          <Loader2 className="h-4 w-4 text-gold/50 animate-spin" />
          <span className="text-[11px] text-gold/50">
            {uploading
              ? "Enviando arquivo MP3..."
              : generatingCover
                ? "Gerando capa com IA..."
                : "Salvando..."}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => addTrackMutation.mutate()}
          disabled={!title.trim() || !mp3File || isSubmitting}
          className="gap-2 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-6 h-10 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-gold/25 hover:text-gold/85 transition-all duration-500"
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
          className="text-[11px] text-muted-foreground/30 hover:text-muted-foreground/50"
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}
