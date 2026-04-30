import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RefreshCw, Home, Music, GraduationCap, Info } from "lucide-react";
import { toast } from "sonner";
import { toastError } from "@/lib/toast-utils";
import { updatePlatformSetting } from "@/lib/platform-settings.functions";
import {
  DEFAULT_CARDS_CONFIG,
  DEFAULT_CARD_SIZING,
  type CardsConfig,
  type CardScopeKey,
  type CardSizing,
} from "@/hooks/use-cards-config";

const SCOPE_META: Array<{
  key: CardScopeKey;
  title: string;
  desc: string;
  Icon: typeof Home;
}> = [
  { key: "home", title: "Home", desc: "Cards exibidos na página inicial do aluno (/home).", Icon: Home },
  { key: "musicas", title: "Músicas", desc: "Cards de louvores e prateleiras de músicas (/musicas).", Icon: Music },
  { key: "cursos", title: "Cursos", desc: "Cards de cursos e meus cursos (/cursos).", Icon: GraduationCap },
];

const FIELDS: Array<{ key: keyof CardSizing; label: string; min: number; max: number; suffix: string }> = [
  { key: "card_width", label: "Largura", min: 120, max: 600, suffix: "px" },
  { key: "card_height", label: "Altura", min: 120, max: 900, suffix: "px" },
  { key: "card_min_width", label: "Largura mínima", min: 80, max: 600, suffix: "px" },
  { key: "card_min_height", label: "Altura mínima", min: 80, max: 900, suffix: "px" },
  { key: "card_border_radius", label: "Arredondamento", min: 0, max: 48, suffix: "px" },
  { key: "card_gap", label: "Espaçamento", min: 0, max: 64, suffix: "px" },
];

interface Props {
  initial: Partial<CardsConfig>;
  onSave?: (config: CardsConfig) => void;
  isLoading?: boolean;
}

export function AdminCardsConfigTab({ initial, onSave, isLoading }: Props) {
  const queryClient = useQueryClient();

  const initialSizing = useMemo<Record<CardScopeKey, CardSizing>>(() => {
    const src = (initial?.sizing as any) ?? {};
    return {
      home: { ...DEFAULT_CARD_SIZING, ...(src.home ?? {}) },
      musicas: { ...DEFAULT_CARD_SIZING, ...(src.musicas ?? {}) },
      cursos: { ...DEFAULT_CARD_SIZING, ...(src.cursos ?? {}) },
    };
  }, [initial]);

  const [sizing, setSizing] = useState<Record<CardScopeKey, CardSizing>>(initialSizing);

  const mutation = useMutation({
    mutationFn: async (value: Record<string, any>) => {
      if (onSave) {
        return onSave(value as CardsConfig);
      }
      return updatePlatformSetting({ data: { key: "cards_config", value } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      queryClient.invalidateQueries({ queryKey: ["platform-settings", "cards_config"] });
      queryClient.invalidateQueries({ queryKey: ["area"] });
      toast.success("Tamanhos de cards salvos!");
    },
    onError: (err: any) => toastError(err),
  });

  function update(scope: CardScopeKey, key: keyof CardSizing, value: number) {
    setSizing((prev) => ({ ...prev, [scope]: { ...prev[scope], [key]: value } }));
  }

  function reset(scope: CardScopeKey) {
    setSizing((prev) => ({ ...prev, [scope]: { ...DEFAULT_CARD_SIZING } }));
  }

  function save() {
    const merged: Partial<CardsConfig> = {
      ...DEFAULT_CARDS_CONFIG,
      ...initial,
      sizing,
    };
    mutation.mutate(merged as any);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-gold/15 bg-gold/[0.03] p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-gold mt-0.5 shrink-0" />
        <p>
          Esses valores controlam o tamanho visual dos cards de cada página.
          No desktop usa o valor exato; no tablet/mobile reduz proporcionalmente
          até a largura mínima, mantendo o layout responsivo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {SCOPE_META.map(({ key, title, desc, Icon }) => {
          const s = sizing[key];
          return (
            <Card key={key} className="bg-card border-border/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                    <Icon className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
                    <p className="text-[11px] text-muted-foreground/70">{desc}</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center justify-center rounded-lg bg-background/40 border border-border/20 p-4 min-h-[180px]">
                  <div
                    className="bg-gradient-to-br from-gold/20 via-gold/5 to-transparent border border-gold/30 shadow-md flex items-center justify-center text-[10px] text-muted-foreground"
                    style={{
                      width: Math.min(s.card_width / 2.2, 140),
                      aspectRatio: `${s.card_width} / ${s.card_height}`,
                      borderRadius: s.card_border_radius / 1.5,
                    }}
                  >
                    {s.card_width} × {s.card_height}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {FIELDS.map((f) => (
                    <div key={f.key}>
                      <Label className="text-[11px] font-semibold text-muted-foreground">
                        {f.label}
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          type="number"
                          min={f.min}
                          max={f.max}
                          value={s[f.key]}
                          onChange={(e) => update(key, f.key, Number(e.target.value) || 0)}
                          className="h-9 text-sm pr-8"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                          {f.suffix}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs"
                  onClick={() => reset(key)}
                >
                  <RefreshCw className="h-3 w-3" /> Restaurar padrão
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={mutation.isPending} className="gap-2">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar configuração de cards
        </Button>
      </div>
    </div>
  );
}
