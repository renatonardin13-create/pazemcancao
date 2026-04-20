import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePlatformSetting } from "@/lib/platform-settings.functions";
import { toastError } from "@/lib/toast-utils";

export interface InspirationalMessage {
  id: string;
  text: string;
  is_active: boolean;
  order: number;
  category?: string;
}

export interface InspirationalBlockConfig {
  enabled: boolean;
  title: string;
  mode: "random" | "fixed";
  type: "biblical" | "motivational" | "custom";
  rotation_seconds: number | null;
  messages: InspirationalMessage[];
}

const DEFAULT_CONFIG: InspirationalBlockConfig = {
  enabled: true,
  title: "Palavra para hoje",
  mode: "random",
  type: "custom",
  rotation_seconds: null,
  messages: [],
};

function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
}

export function AdminInspirationalBlock({
  initial,
}: {
  initial: Partial<InspirationalBlockConfig>;
}) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<InspirationalBlockConfig>({
    ...DEFAULT_CONFIG,
    ...initial,
    messages: (initial.messages || []).map((m, i) => ({
      id: m.id || uid(),
      text: m.text || "",
      is_active: m.is_active !== false,
      order: typeof m.order === "number" ? m.order : i + 1,
      category: m.category,
    })),
  });
  const [newText, setNewText] = useState("");

  useEffect(() => {
    setConfig((prev) => ({ ...prev, ...initial, messages: prev.messages.length ? prev.messages : (initial.messages as any) || [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveMutation = useMutation({
    mutationFn: () =>
      updatePlatformSetting({
        data: { key: "inspirational_block", value: config as any },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success("Bloco inspiracional salvo!");
    },
    onError: (e: any) => toastError(e),
  });

  function addMessage() {
    const text = newText.trim();
    if (!text) return;
    setConfig((c) => ({
      ...c,
      messages: [
        ...c.messages,
        { id: uid(), text, is_active: true, order: c.messages.length + 1 },
      ],
    }));
    setNewText("");
  }

  function updateMessage(id: string, patch: Partial<InspirationalMessage>) {
    setConfig((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }

  function removeMessage(id: string) {
    setConfig((c) => ({ ...c, messages: c.messages.filter((m) => m.id !== id) }));
  }

  function move(id: string, dir: -1 | 1) {
    setConfig((c) => {
      const arr = [...c.messages];
      const i = arr.findIndex((m) => m.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return c;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, messages: arr.map((m, idx) => ({ ...m, order: idx + 1 })) };
    });
  }

  return (
    <Card className="border-border/30 bg-card/40">
      <CardContent className="p-5 space-y-6">
        <div className="flex items-center gap-2 text-gold">
          <Sparkles className="h-4 w-4" />
          <h2 className="font-display text-lg font-bold">Bloco de Mensagem Inspiradora</h2>
        </div>

        {/* Toggle + título + modo + tipo + rotação */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 px-4 py-3">
            <div>
              <Label className="text-sm">Ativar bloco</Label>
              <p className="text-xs text-muted-foreground/70">Mostra a mensagem na página de Louvores.</p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, enabled: v }))}
            />
          </div>

          <div>
            <Label className="text-xs">Título</Label>
            <Input
              value={config.title}
              onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
              placeholder="Palavra para hoje"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Tipo</Label>
            <Select
              value={config.type}
              onValueChange={(v: any) => setConfig((c) => ({ ...c, type: v }))}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="biblical">Bíblico</SelectItem>
                <SelectItem value="motivational">Motivacional</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Modo de exibição</Label>
            <Select
              value={config.mode}
              onValueChange={(v: any) => setConfig((c) => ({ ...c, mode: v }))}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Aleatória</SelectItem>
                <SelectItem value="fixed">Fixa (primeira da lista)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label className="text-xs">Rotação automática</Label>
            <Select
              value={String(config.rotation_seconds ?? "off")}
              onValueChange={(v) =>
                setConfig((c) => ({ ...c, rotation_seconds: v === "off" ? null : Number(v) }))
              }
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Desligado (troca apenas ao recarregar)</SelectItem>
                <SelectItem value="10">A cada 10 segundos</SelectItem>
                <SelectItem value="20">A cada 20 segundos</SelectItem>
                <SelectItem value="30">A cada 30 segundos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de mensagens */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Mensagens ({config.messages.length})</Label>
          </div>

          <div className="flex gap-2">
            <Textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Escreva uma nova mensagem..."
              rows={2}
              className="flex-1"
            />
            <Button onClick={addMessage} variant="premium" className="self-start gap-1.5">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {config.messages.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 italic px-2">Nenhuma mensagem cadastrada ainda.</p>
            ) : (
              config.messages.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-start gap-2 rounded-lg border border-border/30 bg-background/30 p-3"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => move(m.id, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-muted-foreground hover:text-gold disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(m.id, 1)}
                      disabled={idx === config.messages.length - 1}
                      className="rounded p-1 text-muted-foreground hover:text-gold disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Textarea
                    value={m.text}
                    onChange={(e) => updateMessage(m.id, { text: e.target.value })}
                    rows={2}
                    className="flex-1 text-sm"
                  />

                  <div className="flex flex-col items-end gap-2">
                    <Switch
                      checked={m.is_active}
                      onCheckedChange={(v) => updateMessage(m.id, { is_active: v })}
                    />
                    <button
                      type="button"
                      onClick={() => removeMessage(m.id)}
                      className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border/20">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            variant="premium"
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
