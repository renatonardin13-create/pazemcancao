import { useState, useEffect } from "react";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

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

type StatusLevel = "ideal" | "acceptable" | "bad";

function getStatus(diff: number): StatusLevel {
  if (diff <= 0.05) return "ideal";
  if (diff <= 0.15) return "acceptable";
  return "bad";
}

const statusConfig: Record<StatusLevel, { label: string; icon: typeof CheckCircle; className: string }> = {
  ideal: {
    label: "Ideal",
    icon: CheckCircle,
    className: "text-emerald-400/70",
  },
  acceptable: {
    label: "Aceitável",
    icon: AlertTriangle,
    className: "text-amber-400/70",
  },
  bad: {
    label: "Fora do recomendado",
    icon: XCircle,
    className: "text-red-400/70",
  },
};

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
  const [status, setStatus] = useState<StatusLevel | null>(null);

  useEffect(() => {
    const src = file ? URL.createObjectURL(file) : previewUrl;
    if (!src) {
      setDimensions(null);
      setStatus(null);
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
        setStatus(getStatus(diff));
      } else {
        setStatus(null);
      }

      if (file) URL.revokeObjectURL(src);
    };
    img.onerror = () => {
      setDimensions(null);
      setStatus(null);
    };
    img.src = src;
  }, [file, previewUrl, ratio]);

  const actualRatioStr =
    dimensions && dimensions.h > 0
      ? (dimensions.w / dimensions.h).toFixed(2) + ":1"
      : null;

  const cfg = status ? statusConfig[status] : null;

  return (
    <div className="space-y-1 mt-1">
      {/* Recommended specs */}
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

      {/* Validation result */}
      {dimensions && cfg && (
        <div className={`flex items-center gap-1.5 text-[10px] pl-[18px] ${cfg.className}`}>
          <cfg.icon className="h-3 w-3 shrink-0" />
          <span>
            {dimensions.w}×{dimensions.h} px
            {actualRatioStr && <> · proporção {actualRatioStr}</>}
            {" · "}
            <span className="font-medium">{cfg.label}</span>
            {status === "bad" && " para este campo"}
          </span>
        </div>
      )}
    </div>
  );
}
