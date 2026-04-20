import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { toastError } from "@/lib/toast-utils";
import { Progress } from "@/components/ui/progress";
import { ImageFieldHint } from "@/components/ImageFieldHint";

interface ImageUploadFieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  aspectRatio?: string;
  aspectClass?: string;
  uploadLabel?: string;
  /** Expected ratio e.g. "16:9", "3:1" */
  expectedRatio?: string;
  /** Recommended size e.g. "1280x720" */
  recommendedSize?: string;
}

const labelClass = "text-sm font-semibold text-foreground/80";

type UploadState = "idle" | "reading" | "uploading" | "success" | "error";

export function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  bucket = "covers",
  folder = "courses",
  aspectRatio,
  aspectClass = "aspect-video",
  uploadLabel = "Clique para fazer upload",
  expectedRatio,
  recommendedSize,
}: ImageUploadFieldProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
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

      // Show local preview immediately
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      setLastFile(file);
      setErrorMsg("");
      setUploadState("reading");
      setProgress(10);

      try {
        setUploadState("uploading");
        setProgress(30);

        // Refresh session to avoid "exp claim timestamp check failed"
        await supabase.auth.refreshSession().catch(() => {});

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

        let { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { upsert: true, contentType: file.type });

        // Retry once if token expired
        if (uploadError && /exp.*claim|jwt|expired/i.test(uploadError.message)) {
          await supabase.auth.refreshSession();
          const retry = await supabase.storage
            .from(bucket)
            .upload(fileName, file, { upsert: true, contentType: file.type });
          uploadError = retry.error;
        }

        setProgress(80);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        setProgress(100);
        setUploadState("success");

        const finalUrl = `${urlData.publicUrl}?t=${Date.now()}`;
        onChange(finalUrl);
        setPreviewUrl(null); // clear local preview, use final URL
        URL.revokeObjectURL(localUrl);
        toast.success("Imagem enviada com sucesso!");

        // Reset state after a moment
        setTimeout(() => {
          setUploadState("idle");
          setProgress(0);
        }, 2000);
      } catch (err: any) {
        console.error("Upload error:", err);
        setUploadState("error");
        setErrorMsg(err.message || "Erro ao enviar imagem");
        setPreviewUrl(null);
        URL.revokeObjectURL(localUrl);
        toastError(err, "Erro ao enviar imagem");
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

  const isUploading = uploadState === "reading" || uploadState === "uploading";
  const displaySrc = previewUrl || value;

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
        className={`rounded-lg border-2 border-dashed overflow-hidden transition-colors ${
          displaySrc ? "border-border/20 bg-background/20" : "border-gold/40 bg-gold/[0.03] hover:bg-gold/[0.06]"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {displaySrc ? (
          <div className="relative group">
            <img
              src={displaySrc}
              alt={label}
              className={`w-full object-cover ${aspectClass} ${isUploading ? "opacity-50" : ""}`}
              style={aspectRatio ? { aspectRatio } : undefined}
            />
            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-gold/80" />
                <span className="text-xs text-white/80 font-medium">Enviando... {progress}%</span>
                <div className="w-2/3">
                  <Progress value={progress} className="h-1.5 bg-white/20" />
                </div>
              </div>
            )}
            {/* Success overlay */}
            {uploadState === "success" && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-green-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Enviado!
                </div>
              </div>
            )}
            {/* Always-visible remove button (top-right) */}
            {!isUploading && uploadState !== "success" && (
              <button
                type="button"
                onClick={() => { onChange(""); setPreviewUrl(null); setLastFile(null); }}
                title="Remover imagem"
                aria-label="Remover imagem"
                className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {/* Hover overlay with "Trocar" action */}
            {!isUploading && uploadState !== "success" && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center pointer-events-none">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-background/80 text-foreground text-xs font-medium pointer-events-auto"
                >
                  Trocar
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (uploadState === "error") {
                setUploadState("idle");
                setErrorMsg("");
              }
              inputRef.current?.click();
            }}
            disabled={isUploading}
            className={`w-full flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${aspectClass} min-h-[120px]`}
            style={aspectRatio ? { aspectRatio } : undefined}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-gold/60" />
                <span className="text-xs text-gold/60 font-medium">Enviando... {progress}%</span>
                <div className="w-2/3 max-w-[200px]">
                  <Progress value={progress} className="h-1.5 bg-muted/20" />
                </div>
              </>
            ) : uploadState === "error" ? (
              <>
                <AlertCircle className="h-7 w-7 text-destructive/60" />
                <span className="text-xs text-destructive/70 font-medium">{errorMsg}</span>
                <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Clique para tentar novamente
                </span>
              </>
            ) : (
              <>
                <Upload className="h-7 w-7 text-gold/70" />
                <span className="text-xs text-muted-foreground/60 font-medium">{uploadLabel}</span>
              </>
            )}
          </button>
        )}
      </div>

      {expectedRatio && recommendedSize && (
        <ImageFieldHint
          ratio={expectedRatio}
          recommendedSize={recommendedSize}
          file={lastFile}
          previewUrl={displaySrc || undefined}
          autoCrop
        />
      )}
    </div>
  );
}
