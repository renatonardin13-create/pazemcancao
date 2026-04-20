import { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageUploadField } from "@/components/ImageUploadField";
import type { DisplayMode, ContainerRatio } from "@/lib/vitrine-hero";

export type HeroSettingsValue = {
  enabled: boolean;
  image_url: string;
  image_width: number | null;
  image_height: number | null;
  display_mode: DisplayMode;
  container_ratio: ContainerRatio;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  value: HeroSettingsValue;
  onChange: (next: HeroSettingsValue) => void;
  status: SaveStatus;
  errorMessage?: string;
}

const MODE_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: "fill", label: "Preencher (pode cortar)" },
  { value: "contain", label: "Conter (sem cortar)" },
  { value: "cover", label: "Cobrir centralizado" },
  { value: "auto", label: "Automático" },
];

const RATIO_OPTIONS: { value: ContainerRatio; label: string }[] = [
  { value: "auto", label: "Automático (da imagem)" },
  { value: "21/9", label: "Ultrawide 21:9" },
  { value: "16/9", label: "Wide 16:9" },
  { value: "3/1", label: "Banner 3:1" },
  { value: "2/1", label: "Retângulo 2:1" },
];

export function HeroBannerSettings({ value, onChange, status, errorMessage }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(
    value.image_width && value.image_height
      ? { w: value.image_width, h: value.image_height }
      : null,
  );
  const lastUrl = useRef<string | null>(value.image_url || null);

  // Captura dimensões reais da imagem assim que a URL muda
  useEffect(() => {
    const url = value.image_url;
    if (!url) {
      setNaturalDims(null);
      return;
    }
    if (lastUrl.current === url && naturalDims) return;
    lastUrl.current = url;
    const img = new Image();
    img.onload = () => {
      const dims = { w: img.naturalWidth, h: img.naturalHeight };
      setNaturalDims(dims);
      if (dims.w !== value.image_width || dims.h !== value.image_height) {
        onChange({ ...value, image_width: dims.w, image_height: dims.h });
      }
    };
    img.src = url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.image_url]);

  const ratioStr = naturalDims
    ? simplifyRatio(naturalDims.w, naturalDims.h)
    : null;

  return (
    <div className="space-y-5">
      {/* Banner atual */}
      <section className="rounded-xl border border-border/30 bg-card/30 p-5">
        <div className="mb-3 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground/90">
            Banner Principal (Hero da Home)
          </h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground/70">
          Tamanho recomendado: <span className="font-medium text-foreground/80">1920x600 (3:1)</span>.
          Aceita JPG, PNG e WebP.
        </p>

        {value.image_url ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-border/30 bg-zinc-950">
              <img
                src={value.image_url}
                alt="Banner atual"
                className="block h-auto w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <Stat label="Largura" value={naturalDims ? `${naturalDims.w}px` : "—"} />
              <Stat label="Altura" value={naturalDims ? `${naturalDims.h}px` : "—"} />
              <Stat label="Proporção" value={ratioStr || "—"} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmRemove(true)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Remover Banner
              </Button>
              <BannerUploadInline
                onUploaded={(url) =>
                  onChange({ ...value, image_url: url, image_width: null, image_height: null })
                }
                label="Trocar Banner"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/50 bg-background/30 px-6 py-10 text-center">
              <Upload className="h-6 w-6 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground/80">
                Nenhum banner enviado
              </p>
              <p className="text-xs text-muted-foreground/70">
                Envie uma imagem horizontal (recomendado 1920x600).
              </p>
              <BannerUploadInline
                onUploaded={(url) =>
                  onChange({ ...value, image_url: url, image_width: null, image_height: null })
                }
                label="Enviar imagem"
              />
            </div>
          </div>
        )}
      </section>

      {/* Modo de exibição */}
      <section className="rounded-xl border border-border/30 bg-card/30 p-5 space-y-4">
        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
            Modo de exibição do banner
          </Label>
          <Select
            value={value.display_mode}
            onValueChange={(v) => onChange({ ...value, display_mode: v as DisplayMode })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
            Proporção do container
          </Label>
          <Select
            value={value.container_ratio}
            onValueChange={(v) => onChange({ ...value, container_ratio: v as ContainerRatio })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATIO_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground/90">
              Exibir banner principal na vitrine
            </p>
            <p className="text-xs text-muted-foreground/70">
              Quando desligado, o hero não aparece para o aluno.
            </p>
          </div>
          <Switch
            checked={value.enabled}
            onCheckedChange={(v) => onChange({ ...value, enabled: v })}
          />
        </div>
      </section>

      {/* Estado do autosave */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
        {status === "saving" && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
          </>
        )}
        {status === "saved" && (
          <>
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-300/80">Salvo automaticamente.</span>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="h-3 w-3 text-red-400" />
            <span className="text-red-300/80">{errorMessage || "Falha ao salvar."}</span>
          </>
        )}
        {status === "idle" && (
          <>
            <Info className="h-3 w-3" />
            As alterações são salvas automaticamente no banco de dados.
          </>
        )}
      </div>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover banner?</AlertDialogTitle>
            <AlertDialogDescription>
              A imagem será removida do banner principal. Você poderá enviar outra a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onChange({ ...value, image_url: "", image_width: null, image_height: null });
                setConfirmRemove(false);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/30 bg-background/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground/90">{value}</p>
    </div>
  );
}

function BannerUploadInline({
  onUploaded,
  label,
}: {
  onUploaded: (url: string) => void;
  label: string;
}) {
  return (
    <div className="w-full">
      <ImageUploadField
        label={label}
        hint="JPG, PNG ou WebP — recomendado 1920x600 (3:1)."
        value=""
        onChange={onUploaded}
        folder="hero-banners"
        bucket="covers"
        aspectClass="aspect-[3/1]"
        uploadLabel="Arraste a imagem aqui ou clique para enviar"
      />
    </div>
  );
}

function simplifyRatio(w: number, h: number): string {
  if (!w || !h) return "—";
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}
