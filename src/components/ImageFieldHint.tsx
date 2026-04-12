import { useState, useEffect } from "react";
import { Info, AlertTriangle } from "lucide-react";

interface ImageFieldHintProps {
  /** e.g. "16:9", "3:1", "1:1", "2:3" */
  ratio: string;
  /** e.g. "1280x720" */
  recommendedSize: string;
  /** defaults to "JPG, PNG, WebP" */
  formats?: string;
  /** show auto-crop note */
  autoCrop?: boolean;
  /** extra note line */
  note?: string;
  /** File to validate dimensions against */
  file?: File | null;
  /** URL to validate (when no file, e.g. pasted URL with loaded img) */
  previewUrl?: string | null;
}

function parseRatio(ratio: string): number | null {
  const parts = ratio.split(":");
  if (parts.length !== 2) return null;
  const w = parseFloat(parts[0]);
  const h = parseFloat(parts[1]);
  if (!w || !h) return null;
  return w / h;
}

export function ImageFieldHint({
  ratio,
  recommendedSize,
  formats = "JPG, PNG, WebP",
  autoCrop,
  note,
  file,
  previewUrl,
}: ImageFieldHintProps) {
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const src = file ? URL.createObjectURL(file) : previewUrl;
    if (!src) {
      setDimensions(null);
      setWarning(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setDimensions({ w, h });

      const target = parseRatio(ratio);
      if (target && h > 0) {
        const actual = w / h;
        const diff = Math.abs(actual - target) / target;
        if (diff > 0.15) {
          setWarning(
            "Esta imagem está fora da proporção recomendada e pode sofrer corte na exibição."
          );
        } else {
          setWarning(null);
        }
      }

      if (file) URL.revokeObjectURL(src);
    };
    img.onerror = () => {
      setDimensions(null);
      setWarning(null);
    };
    img.src = src;
  }, [file, previewUrl, ratio]);

  return (
    <div className="space-y-1 mt-1">
      <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground/35 leading-relaxed">
        <Info className="h-3 w-3 mt-[1px] shrink-0 text-muted-foreground/25" />
        <div>
          <span>Proporção: <span className="text-muted-foreground/50">{ratio}</span></span>
          <span className="mx-1.5">·</span>
          <span>Tamanho: <span className="text-muted-foreground/50">{recommendedSize} px</span></span>
          <span className="mx-1.5">·</span>
          <span>Formatos: <span className="text-muted-foreground/50">{formats}</span></span>
        </div>
      </div>

      {autoCrop && (
        <p className="text-[9px] text-muted-foreground/25 pl-[18px]">
          A imagem poderá ser ajustada automaticamente para o formato da área de exibição.
        </p>
      )}

      {note && (
        <p className="text-[9px] text-muted-foreground/25 pl-[18px]">{note}</p>
      )}

      {dimensions && (
        <p className="text-[9px] text-muted-foreground/30 pl-[18px]">
          Imagem enviada: {dimensions.w}×{dimensions.h} px
          {dimensions.w > 0 && dimensions.h > 0 && (
            <> (proporção {(dimensions.w / dimensions.h).toFixed(2)}:1)</>
          )}
        </p>
      )}

      {warning && (
        <div className="flex items-center gap-1.5 text-[9px] text-amber-400/70 pl-[18px]">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}
