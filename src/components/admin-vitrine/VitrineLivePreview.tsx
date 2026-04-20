import { Eye, ChevronDown, ChevronUp, ImageOff } from "lucide-react";
import { useState } from "react";
import {
  DevicePreviewToggle,
  deviceWidth,
  type DeviceKind,
} from "./DevicePreviewToggle";
import type { HeroSettingsValue } from "./HeroBannerSettings";
import { ratioToCss, modeToObjectFit } from "@/lib/vitrine-hero";

interface Props {
  hero: HeroSettingsValue;
}

export function VitrineLivePreview({ hero }: Props) {
  const [device, setDevice] = useState<DeviceKind>("desktop");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground/90">Pré-visualização</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Ao vivo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DevicePreviewToggle value={device} onChange={setDevice} />
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-border/40 px-2 py-1 text-xs text-muted-foreground/80 hover:text-foreground"
          >
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            {collapsed ? "Expandir" : "Recolher"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="overflow-x-auto p-4">
          <div
            className="mx-auto rounded-xl border border-border/30 bg-background/40 transition-all"
            style={{ maxWidth: deviceWidth[device], width: "100%" }}
          >
            <HeroPreview hero={hero} />
          </div>
        </div>
      )}
    </div>
  );
}

function HeroPreview({ hero }: { hero: HeroSettingsValue }) {
  if (!hero.enabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/40 bg-zinc-950/50 px-6 py-16 text-center">
        <ImageOff className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground/80">Banner desativado</p>
        <p className="text-xs text-muted-foreground/60">
          Ative o toggle "Exibir banner principal" para ver a prévia.
        </p>
      </div>
    );
  }

  if (!hero.image_url) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/40 bg-zinc-950/50 px-6 py-16 text-center">
        <ImageOff className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground/80">Nenhum banner ativo no momento</p>
        <p className="text-xs text-muted-foreground/60">
          Envie uma imagem para visualizar como ficará na vitrine.
        </p>
      </div>
    );
  }

  const aspect = ratioToCss(hero.container_ratio);
  const fit = modeToObjectFit(hero.display_mode);
  const hasContainer = !!aspect;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-white/5"
      style={hasContainer ? { aspectRatio: aspect } : undefined}
    >
      <img
        src={hero.image_url}
        alt="Pré-visualização do banner"
        className={
          hasContainer
            ? "absolute inset-0 block h-full w-full"
            : "block h-auto w-full"
        }
        style={hasContainer ? { objectFit: fit || "cover" } : fit ? { objectFit: fit } : undefined}
      />
    </div>
  );
}
