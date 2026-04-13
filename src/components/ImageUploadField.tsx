import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  aspectRatio?: string;
  aspectClass?: string;
}

const labelClass = "text-sm font-semibold text-foreground/80";

export function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  bucket = "covers",
  folder = "courses",
  aspectRatio,
  aspectClass = "aspect-video",
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Selecione um arquivo de imagem válido");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem deve ter no máximo 5MB");
        return;
      }

      setUploading(true);
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        onChange(`${urlData.publicUrl}?t=${Date.now()}`);
        toast.success("Imagem enviada com sucesso!");
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(err.message || "Erro ao enviar imagem");
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-2.5">
      <div>
        <Label className={labelClass}>{label}</Label>
        <p className="text-xs text-muted-foreground/50 mt-0.5">{hint}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className="rounded-lg border border-dashed border-border/20 bg-background/20 overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt={label}
              className={`w-full object-cover ${aspectClass}`}
              style={aspectRatio ? { aspectRatio } : undefined}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-background/80 text-foreground text-xs font-medium mr-2"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive text-destructive-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={`w-full flex flex-col items-center justify-center gap-2 text-muted-foreground/25 cursor-pointer hover:text-muted-foreground/40 transition-colors ${aspectClass}`}
            style={aspectRatio ? { aspectRatio } : undefined}
          >
            {uploading ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-gold/50" />
                <span className="text-xs">Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="h-7 w-7" />
                <span className="text-xs">Clique ou arraste para fazer upload</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
